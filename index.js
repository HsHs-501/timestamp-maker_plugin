(function () {
  var FORMATS = [
    { code: "t", name: "Short Time" },
    { code: "T", name: "Long Time" },
    { code: "d", name: "Short Date" },
    { code: "D", name: "Long Date" },
    { code: "f", name: "Short Date/Time" },
    { code: "F", name: "Long Date/Time with Weekday" },
    { code: "R", name: "Relative" }
  ];

  var unregisterCommand = null;

  function padZero(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function formatDate(d) {
    if (!d || isNaN(d.getTime())) return "";
    return d.getFullYear() + "-" + padZero(d.getMonth() + 1) + "-" + padZero(d.getDate());
  }

  function formatTime(d) {
    if (!d || isNaN(d.getTime())) return "";
    return padZero(d.getHours()) + ":" + padZero(d.getMinutes());
  }

  function parseDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    var dMatch = String(dateStr).trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (!dMatch) return null;
    var year = parseInt(dMatch[1], 10);
    var month = parseInt(dMatch[2], 10);
    var day = parseInt(dMatch[3], 10);

    var tMatch = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!tMatch) return null;
    var hours = parseInt(tMatch[1], 10);
    var minutes = parseInt(tMatch[2], 10);
    var seconds = tMatch[3] ? parseInt(tMatch[3], 10) : 0;

    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    if (hours < 0 || hours > 23) return null;
    if (minutes < 0 || minutes > 59) return null;
    if (seconds < 0 || seconds > 59) return null;

    var dateObj = new Date(year, month - 1, day, hours, minutes, seconds);
    if (isNaN(dateObj.getTime())) return null;
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day ||
      dateObj.getHours() !== hours ||
      dateObj.getMinutes() !== minutes
    ) {
      return null;
    }
    return dateObj;
  }

  function parseWhen(input) {
    if (!input || typeof input !== "string" || !input.trim()) {
      return new Date();
    }
    var str = input.trim();
    var lower = str.toLowerCase();

    if (lower === "now") {
      return new Date();
    }

    var relMatch = lower.match(/^\+(\d+)\s*(m|min|mins|minutes?|h|hr|hrs|hours?|d|days?|w|weeks?)$/);
    if (relMatch) {
      var amount = parseInt(relMatch[1], 10);
      var unit = relMatch[2].charAt(0);
      var ms = 0;
      if (unit === "m") ms = amount * 60 * 1000;
      else if (unit === "h") ms = amount * 3600 * 1000;
      else if (unit === "d") ms = amount * 86400 * 1000;
      else if (unit === "w") ms = amount * 7 * 86400 * 1000;
      return new Date(Date.now() + ms);
    }

    var tomMatch = lower.match(/^tomorrow(?:\s+(\d{1,2}):(\d{2}))?$/);
    if (tomMatch) {
      var tom = new Date();
      tom.setDate(tom.getDate() + 1);
      var h = tomMatch[1] ? parseInt(tomMatch[1], 10) : 9;
      var m = tomMatch[2] ? parseInt(tomMatch[2], 10) : 0;
      tom.setHours(h, m, 0, 0);
      return tom;
    }

    var timeMatch = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (timeMatch) {
      var today = new Date();
      var th = parseInt(timeMatch[1], 10);
      var tm = parseInt(timeMatch[2], 10);
      var ts = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      if (th >= 0 && th <= 23 && tm >= 0 && tm <= 59 && ts >= 0 && ts <= 59) {
        today.setHours(th, tm, ts, 0);
        return today;
      }
    }

    var fullMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (fullMatch) {
      var fy = parseInt(fullMatch[1], 10);
      var fm = parseInt(fullMatch[2], 10);
      var fd = parseInt(fullMatch[3], 10);
      var fh = fullMatch[4] ? parseInt(fullMatch[4], 10) : 0;
      var fmin = fullMatch[5] ? parseInt(fullMatch[5], 10) : 0;
      var fs = fullMatch[6] ? parseInt(fullMatch[6], 10) : 0;
      var fDate = new Date(fy, fm - 1, fd, fh, fmin, fs);
      if (!isNaN(fDate.getTime()) && fDate.getFullYear() === fy && fDate.getMonth() === fm - 1 && fDate.getDate() === fd) {
        return fDate;
      }
    }

    var fallbackDate = new Date(str);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }

    return null;
  }

  function copyToClipboard(text) {
    var copied = false;
    try {
      var clip = (vendetta.metro && vendetta.metro.common && vendetta.metro.common.clipboard) ||
                 (vendetta.metro && vendetta.metro.findByProps && vendetta.metro.findByProps("setString", "getString")) ||
                 (vendetta.metro && vendetta.metro.findByProps && vendetta.metro.findByProps("setString")) ||
                 (vendetta.metro && vendetta.metro.common && vendetta.metro.common.ReactNative && vendetta.metro.common.ReactNative.Clipboard);
      if (clip && typeof clip.setString === "function") {
        clip.setString(text);
        copied = true;
      }
    } catch (e) {}

    if (!copied) {
      try {
        if (vendetta.ui && vendetta.ui.alerts && vendetta.ui.alerts.showConfirmationAlert) {
          vendetta.ui.alerts.showConfirmationAlert({
            title: "Copy Timestamp",
            content: text,
            confirmText: "OK"
          });
        }
      } catch (err) {}
    }
  }

  function sendLocalMessage(channelId, text) {
    var sent = false;
    try {
      var botMsgModule = vendetta.metro && vendetta.metro.findByProps && vendetta.metro.findByProps("sendBotMessage");
      if (botMsgModule && typeof botMsgModule.sendBotMessage === "function" && channelId) {
        botMsgModule.sendBotMessage(channelId, text);
        sent = true;
      }
    } catch (e) {}

    if (!sent) {
      try {
        if (vendetta.ui && vendetta.ui.alerts && vendetta.ui.alerts.showConfirmationAlert) {
          vendetta.ui.alerts.showConfirmationAlert({
            title: "Timestamp",
            content: text,
            confirmText: "OK"
          });
        }
      } catch (err) {}
    }
  }

  function getActiveChannelId(ctx) {
    try {
      if (ctx && ctx.channel && ctx.channel.id) return ctx.channel.id;
      if (ctx && ctx.channelId) return ctx.channelId;
      var channelStore = vendetta.metro && vendetta.metro.findByProps && vendetta.metro.findByProps("getChannelId");
      if (channelStore && typeof channelStore.getChannelId === "function") {
        return channelStore.getChannelId();
      }
    } catch (e) {}
    return null;
  }

  function getOptionValue(args, optionName) {
    if (!args) return null;
    if (Array.isArray(args)) {
      for (var i = 0; i < args.length; i++) {
        if (args[i] && args[i].name === optionName) return args[i].value;
      }
      if (args[0] && args[0].value !== undefined) return args[0].value;
    }
    if (typeof args === "object" && args[optionName] !== undefined) {
      return args[optionName].value !== undefined ? args[optionName].value : args[optionName];
    }
    return null;
  }

  function registerSlashCommand() {
    try {
      if (vendetta.commands && typeof vendetta.commands.registerCommand === "function") {
        unregisterCommand = vendetta.commands.registerCommand({
          name: "timestamp",
          displayName: "timestamp",
          description: "Generate Discord timestamp tags",
          displayDescription: "Generate Discord timestamp tags",
          options: [
            {
              name: "when",
              displayName: "when",
              description: "Date/time, e.g. 2026-10-25 21:30, 21:30, +2h, +30m, +1d, tomorrow 09:00, now",
              displayDescription: "Date/time, e.g. 2026-10-25 21:30, 21:30, +2h, +30m, +1d, tomorrow 09:00, now",
              type: 3,
              required: false
            }
          ],
          execute: function (args, ctx) {
            try {
              var whenVal = getOptionValue(args, "when");
              var targetDate = parseWhen(whenVal);
              var channelId = getActiveChannelId(ctx);

              if (!targetDate) {
                sendLocalMessage(
                  channelId,
                  "**Timestamp Maker**: Invalid date/time input: `" + (whenVal || "") + "`\nExamples: `2026-10-25 21:30`, `21:30`, `+2h`, `+30m`, `+1d`, `tomorrow 09:00`, `now`."
                );
                return;
              }

              var unix = Math.floor(targetDate.getTime() / 1000);
              for (var i = 0; i < FORMATS.length; i++) {
                var fmt = FORMATS[i];
                var tag = "<t:" + unix + ":" + fmt.code + ">";
                var msg = tag + "\n`" + tag + "`";
                sendLocalMessage(channelId, msg);
              }
            } catch (execErr) {}
          }
        });
      }
    } catch (err) {}
  }

  function Settings() {
    var React = (vendetta.metro && vendetta.metro.common && vendetta.metro.common.React) || null;
    var ReactNative = (vendetta.metro && vendetta.metro.common && vendetta.metro.common.ReactNative) ||
                      (vendetta.metro && vendetta.metro.findByProps && vendetta.metro.findByProps("View", "Text")) || {};
    var storage = vendetta.plugin && vendetta.plugin.storage;
    var useProxy = vendetta.storage && vendetta.storage.useProxy;

    if (useProxy && storage) {
      useProxy(storage);
    }

    if (!React) {
      return null;
    }

    var defaultDate = formatDate(new Date());
    var defaultTime = formatTime(new Date());

    if (storage) {
      if (!storage.date || typeof storage.date !== "string") {
        storage.date = defaultDate;
      }
      if (!storage.time || typeof storage.time !== "string") {
        storage.time = defaultTime;
      }
    }

    var stateArr = React.useState({
      date: (storage && storage.date) || defaultDate,
      time: (storage && storage.time) || defaultTime
    });
    var localState = stateArr[0];
    var setLocalState = stateArr[1];

    var currentDate = (storage && storage.date) || localState.date;
    var currentTime = (storage && storage.time) || localState.time;

    function updateDate(newDate) {
      var val = typeof newDate === "string" ? newDate : (newDate && newDate.nativeEvent ? newDate.nativeEvent.text : "");
      if (storage) storage.date = val;
      setLocalState(function (prev) {
        return { date: val, time: prev.time };
      });
    }

    function updateTime(newTime) {
      var val = typeof newTime === "string" ? newTime : (newTime && newTime.nativeEvent ? newTime.nativeEvent.text : "");
      if (storage) storage.time = val;
      setLocalState(function (prev) {
        return { date: prev.date, time: val };
      });
    }

    function setBoth(newDate, newTime) {
      if (storage) {
        storage.date = newDate;
        storage.time = newTime;
      }
      setLocalState({ date: newDate, time: newTime });
    }

    function onQuickNow() {
      var now = new Date();
      setBoth(formatDate(now), formatTime(now));
    }

    function onQuickPlus1Hour() {
      var base = parseDateTime(currentDate, currentTime) || new Date();
      var target = new Date(base.getTime() + 3600 * 1000);
      setBoth(formatDate(target), formatTime(target));
    }

    function onQuickPlus1Day() {
      var base = parseDateTime(currentDate, currentTime) || new Date();
      var target = new Date(base.getTime() + 86400 * 1000);
      setBoth(formatDate(target), formatTime(target));
    }

    function onQuickTomorrow9() {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setBoth(formatDate(tomorrow), formatTime(tomorrow));
    }

    var Forms = (vendetta.ui && vendetta.ui.components && vendetta.ui.components.Forms) ||
                (vendetta.metro && vendetta.metro.findByProps && vendetta.metro.findByProps("FormRow", "FormSection")) || {};
    var FormSection = Forms.FormSection || ReactNative.View;
    var FormRow = Forms.FormRow || ReactNative.View;
    var FormInput = Forms.FormInput || ReactNative.TextInput;
    var FormDivider = Forms.FormDivider || ReactNative.View;

    var parsed = parseDateTime(currentDate, currentTime);
    var unix = parsed ? Math.floor(parsed.getTime() / 1000) : null;

    function renderPresetButton(label, onPress) {
      return React.createElement(
        ReactNative.TouchableOpacity,
        {
          key: label,
          onPress: onPress,
          style: {
            backgroundColor: "#5865F2",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 6,
            marginRight: 8,
            marginBottom: 8
          }
        },
        React.createElement(
          ReactNative.Text,
          {
            style: {
              color: "#FFFFFF",
              fontWeight: "bold",
              fontSize: 13
            }
          },
          label
        )
      );
    }

    var children = [];

    children.push(
      React.createElement(
        FormSection,
        { key: "section-inputs", title: "Date & Time Selection" },
        React.createElement(FormInput, {
          title: "Date (YYYY-MM-DD)",
          placeholder: "YYYY-MM-DD",
          value: currentDate,
          onChange: updateDate,
          onChangeText: updateDate
        }),
        FormDivider ? React.createElement(FormDivider, { key: "div-inputs" }) : null,
        React.createElement(FormInput, {
          title: "Time (HH:mm, 24-hour)",
          placeholder: "HH:mm",
          value: currentTime,
          onChange: updateTime,
          onChangeText: updateTime
        })
      )
    );

    children.push(
      React.createElement(
        FormSection,
        { key: "section-presets", title: "Quick Presets" },
        React.createElement(
          ReactNative.View,
          {
            style: {
              flexDirection: "row",
              flexWrap: "wrap",
              paddingHorizontal: 16,
              paddingVertical: 8
            }
          },
          renderPresetButton("Now", onQuickNow),
          renderPresetButton("+1 Hour", onQuickPlus1Hour),
          renderPresetButton("+1 Day", onQuickPlus1Day),
          renderPresetButton("Tomorrow 09:00", onQuickTomorrow9)
        )
      )
    );

    if (unix !== null) {
      var rows = [];
      for (var i = 0; i < FORMATS.length; i++) {
        var fmt = FORMATS[i];
        var tag = "<t:" + unix + ":" + fmt.code + ">";
        (function (t, formatInfo) {
          rows.push(
            React.createElement(FormRow, {
              key: formatInfo.code,
              label: formatInfo.name + " (" + formatInfo.code + ")",
              subLabel: t,
              trailing: React.createElement(
                ReactNative.Text,
                { style: { color: "#5865F2", fontSize: 13, fontWeight: "600" } },
                "Tap to Copy"
              ),
              onPress: function () {
                copyToClipboard(t);
              }
            })
          );
        })(tag, fmt);
      }

      children.push(
        React.createElement(
          FormSection,
          { key: "section-results", title: "Discord Timestamps (Tap to Copy)" },
          rows
        )
      );
    } else {
      children.push(
        React.createElement(
          FormSection,
          { key: "section-error", title: "Status" },
          React.createElement(
            ReactNative.View,
            { style: { padding: 16 } },
            React.createElement(
              ReactNative.Text,
              {
                style: {
                  color: "#ED4245",
                  fontSize: 14,
                  fontWeight: "bold"
                }
              },
              "Invalid Date or Time format. Please ensure Date is YYYY-MM-DD and Time is HH:mm (24-hour)."
            )
          )
        )
      );
    }

    return React.createElement(
      ReactNative.ScrollView,
      {
        style: { flex: 1 },
        contentContainerStyle: { paddingBottom: 32 }
      },
      children
    );
  }

  function onLoad() {
    try {
      var storage = vendetta.plugin && vendetta.plugin.storage;
      if (storage) {
        if (!storage.date) {
          storage.date = formatDate(new Date());
        }
        if (!storage.time) {
          storage.time = formatTime(new Date());
        }
      }
    } catch (e) {}

    registerSlashCommand();
  }

  function onUnload() {
    try {
      if (typeof unregisterCommand === "function") {
        unregisterCommand();
        unregisterCommand = null;
      }
    } catch (e) {}
  }

  return {
    onLoad: onLoad,
    onUnload: onUnload,
    settings: Settings
  };
})()