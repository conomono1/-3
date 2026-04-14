/**
 * Calculator UI logic (display, keypad, keyboard).
 * Depends on DOM: #expr, #result, .calc with [data-action] buttons.
 */
(function () {
  var exprEl = document.getElementById("expr");
  var resultEl = document.getElementById("result");
  var current = "0";
  var stored = null;
  var pendingOp = null;
  var fresh = false;
  var DISPLAY_MAX = 14;
  var ERR = "\uC624\uB958";

  function formatNum(n) {
    if (!isFinite(n)) return ERR;
    var s = String(n);
    if (s.length <= DISPLAY_MAX) return s;
    return n.toPrecision(DISPLAY_MAX);
  }

  function opSymbol(op) {
    if (op === "+") return "+";
    if (op === "-") return "\u2212";
    if (op === "*") return "\u00D7";
    if (op === "/") return "\u00F7";
    if (op === "%") return "%";
    return op;
  }

  function renderExpr() {
    if (stored === null || pendingOp === null) {
      exprEl.textContent = "";
      return;
    }
    exprEl.textContent = formatNum(stored) + " " + opSymbol(pendingOp);
  }

  function render() {
    resultEl.textContent = current;
    renderExpr();
  }

  function applyOp(a, b, op) {
    if (op === "+") return a + b;
    if (op === "-") return a - b;
    if (op === "*") return a * b;
    if (op === "/") return b === 0 ? NaN : a / b;
    if (op === "%") return a % b;
    return b;
  }

  function commit() {
    if (stored === null || pendingOp === null) return;
    var a = stored;
    var b = parseFloat(current);
    var out = applyOp(a, b, pendingOp);
    current = formatNum(out);
    stored = null;
    pendingOp = null;
    if (current === ERR) fresh = true;
  }

  function inputDigit(d) {
    if (fresh) {
      current = d;
      fresh = false;
    } else if (current === "0" && d !== "0") {
      current = d;
    } else if (current === "0" && d === "0") {
      return;
    } else if (current.replace(".", "").length >= DISPLAY_MAX) {
      return;
    } else {
      current += d;
    }
  }

  function inputDot() {
    if (fresh) {
      current = "0.";
      fresh = false;
      return;
    }
    if (current.indexOf(".") >= 0) return;
    current += ".";
  }

  function setOp(op) {
    var n = parseFloat(current);
    if (stored !== null && pendingOp !== null && !fresh) {
      var r = applyOp(stored, n, pendingOp);
      if (!isFinite(r)) {
        current = ERR;
        stored = null;
        pendingOp = null;
        fresh = true;
        render();
        return;
      }
      stored = r;
      current = formatNum(stored);
    } else {
      stored = n;
    }
    pendingOp = op;
    fresh = true;
    render();
  }

  function equals() {
    if (pendingOp === null) return;
    commit();
    fresh = true;
    render();
  }

  function clearAll() {
    current = "0";
    stored = null;
    pendingOp = null;
    fresh = false;
    render();
  }

  function backspace() {
    if (fresh || current === ERR) return;
    current = current.length <= 1 ? "0" : current.slice(0, -1);
    render();
  }

  document.querySelector(".calc").addEventListener("click", function (ev) {
    var btn = ev.target.closest("button");
    if (!btn) return;
    var action = btn.getAttribute("data-action");
    if (current === ERR && action !== "clear") return;

    if (action === "digit") inputDigit(btn.getAttribute("data-digit"));
    else if (action === "dot") inputDot();
    else if (action === "op") setOp(btn.getAttribute("data-op"));
    else if (action === "equals") equals();
    else if (action === "clear") clearAll();
    else if (action === "back") backspace();
    else return;

    if (action !== "op" && action !== "equals") render();
    else if (action === "op") renderExpr();
  });

  document.addEventListener("keydown", function (ev) {
    if (current === ERR && ev.key !== "Escape") return;
    var k = ev.key;
    if (k >= "0" && k <= "9") {
      ev.preventDefault();
      inputDigit(k);
      render();
    } else if (k === ".") {
      ev.preventDefault();
      inputDot();
      render();
    } else if ("+-*/%".indexOf(k) >= 0) {
      ev.preventDefault();
      setOp(k);
    } else if (k === "Enter" || k === "=") {
      ev.preventDefault();
      equals();
    } else if (k === "Escape") {
      ev.preventDefault();
      clearAll();
    } else if (k === "Backspace") {
      ev.preventDefault();
      backspace();
    }
  });

  render();
})();
