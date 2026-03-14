from flask import Flask, jsonify, request
import openai

app = Flask(__name__)

@app.route("/insights", methods=["POST"])
def get_insights():
    data = request.json
    spending_data = data.get("spending", {})

    # Dummy insight for now
    insights = "Your travel expenses increased 40% this week."
    return jsonify({"insight": insights})

if __name__ == "__main__":
    app.run(port=5000)
