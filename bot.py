# bot.py — «Взломай код» как HTML-виджет в сообщении (Bot API 10.4)
# Запуск: pip install requests && python bot.py
import json, os, random, time
import requests

TOKEN = "ВСТАВЬ_ТОКЕН_ОТ_BOTFATHER"
API = "https://api.telegram.org/bot" + TOKEN
HERE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(HERE, "widget_db.json")
HTML = open(os.path.join(HERE, "widget.html"), encoding="utf-8").read()
ATT = {3: 5, 4: 6, 5: 7, 6: 8}

db = {"games": {}, "records": {}}
if os.path.exists(DB):
    try:
        db = json.load(open(DB, encoding="utf-8"))
    except Exception:
        pass

def save():
    tmp = DB + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False)
    os.replace(tmp, DB)

def call(method, **params):
    r = requests.post(API + "/" + method, json=params, timeout=40).json()
    if not r.get("ok"):
        raise RuntimeError(method + ": " + str(r.get("description")))
    return r["result"]

def jstr(o):
    return json.dumps(o, ensure_ascii=False, separators=(",", ":"))

def new_game(l, uid):
    return {"secret": "".join(map(str, random.sample(range(10), l))),
            "l": l, "m": ATT[l], "a": 0, "h": [], "t": int(time.time()),
            "o": 0, "w": 0, "tm": 0, "r": 0, "uid": str(uid)}

def state(g):
    s = {"s": "g", "l": g["l"], "m": g["m"], "a": g["a"], "h": g["h"],
         "t": g["t"], "o": g["o"], "w": g["w"], "tm": g["tm"], "r": g["r"]}
    if g["o"] and not g["w"]:
        s["c"] = g["secret"]
    return s

def feedback(guess, secret):
    return "".join("c" if a == b else ("m" if a in secret else "w")
                   for a, b in zip(guess, secret))

def on_message(m):
    if (m.get("text") or "").startswith("/start"):
        call("sendWidget", chat_id=m["chat"]["id"], html=HTML,
             chat_data=jstr({"s": "m"}), allow_queries=True,
             caption="🔓 Взломай код — играй прямо в чате")

def on_query(q):
    chat, mid, uid = q["chat"]["id"], q["message_id"], str(q["from"]["id"])
    data = q.get("data") or ""
    key = str(chat) + ":" + str(mid)
    g = db["games"].get(key)
    answer = None

    if data == "r":
        answer = jstr({"rec": db["records"].get(uid, {})})
    else:
        ng, newst, drop = None, None, False
        if data in ("s:3", "s:4", "s:5", "s:6"):
            ng = new_game(int(data[2]), uid)
            newst = state(ng)
        elif data == "m":
            newst, drop = {"s": "m"}, True
        elif data == "n" and g:
            ng = new_game(g["l"], uid)
            newst = state(ng)
        elif data.startswith("c:") and g and not g["o"]:
            guess = data[2:]
            ok = (len(guess) == g["l"] and len(set(guess)) == g["l"]
                  and all(c in "0123456789" for c in guess))
            if ok:
                fb = feedback(guess, g["secret"])
                g["h"].append(guess + ":" + fb)
                g["a"] += 1
                if fb == "c" * g["l"]:
                    g["o"] = g["w"] = 1
                    g["tm"] = int(time.time()) - g["t"]
                    rec = db["records"].setdefault(uid, {})
                    old = rec.get(str(g["l"]))
                    if not old or g["tm"] < old["t"]:
                        rec[str(g["l"])] = {"t": g["tm"], "a": g["a"], "d": int(time.time())}
                        g["r"] = 1
                elif g["a"] >= g["m"]:
                    g["o"] = 1
                    g["tm"] = int(time.time()) - g["t"]
                ng, newst = g, state(g)
            else:
                answer = jstr(dict(state(g), e="bad"))

        if newst is not None:
            try:
                call("editMessageWidgetData", chat_id=chat, message_id=mid,
                     chat_data=jstr(newst))
                edited = True
            except RuntimeError as ex:
                edited = "not modified" in str(ex)
            if edited:
                if drop:
                    db["games"].pop(key, None)
                elif ng is not None:
                    db["games"][key] = ng
                save()
                answer = jstr(newst)
            else:
                cur = db["games"].get(key)
                answer = jstr(state(cur) if cur else {"s": "m"})
        if answer is None:
            answer = jstr(state(g) if g else {"s": "m"})

    try:
        call("answerWidgetQuery", widget_query_id=q["id"], data=answer)
    except RuntimeError as ex:
        print("answerWidgetQuery:", ex)

def main():
    print("Бот запущен. Отправь /start в личном чате с ботом.")
    offset = None
    while True:
        params = {"timeout": 30, "allowed_updates": ["message", "widget_query"]}
        if offset is not None:
            params["offset"] = offset
        try:
            updates = call("getUpdates", **params)
        except (requests.RequestException, RuntimeError) as ex:
            print("getUpdates:", ex)
            time.sleep(3)
            continue
        for u in updates:
            offset = u["update_id"] + 1
            try:
                if u.get("message"):
                    on_message(u["message"])
                elif u.get("widget_query"):
                    on_query(u["widget_query"])
            except Exception as ex:
                print("handler:", ex)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
