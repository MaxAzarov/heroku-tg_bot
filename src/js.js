const puppeteer = require("puppeteer");
const TelegramBot = require("node-telegram-bot-api");
const token = "1140081708:AAExicZmtRlepyfDCZYqMryxcppXS8QBew8";
const bot = new TelegramBot(token, { polling: true });
bot.onText(/\/route/, (msg, match) => {
  let scrape = async () => {
    const browser = await puppeteer.launch({
      headless: false
    });
    const page = await browser.newPage();
    await page.goto("https://www.eway.in.ua/ru/cities/lviv");
    await page.click("#map_button_routes_page");
    await page.waitFor(1000);
    await page.click("#route_link_244");
    await page.waitFor(1000);
    const result = await page.evaluate(() => {
      const data = document.querySelectorAll(
        "#content > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-marker-pane.leaflet-zoom-hide > div.gps-vehicle"
      );
      return data;
    });
    browser.close();
    return result;
  };

  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Виберіть місце для пошуку маршрутки", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Галицьке перехрестя",
            callback_data: "Галицьке перехрестя"
          },
          {
            text: "Бурса",
            callback_data: "Бурса"
          },
          {
            text: "Проспект Червоної калини",
            callback_data: "Проспект Червоної калини"
          }
        ]
      ]
    }
  });
  let available = 0;
  let idUser = 0;
  let displayed = 1;
  bot.on("callback_query", query => {
    scrape().then(value => {
      for (let key in value) {
        const { id, _leaflet_pos } = value[key];
        x = _leaflet_pos.x;
        y = _leaflet_pos.y;
        idUser = query.message.chat.id;
        if (query.data == "Галицьке перехрестя") {
          y < 25 ? available++ : null;
        } else if (query.data == "Бурса") {
          y < 280 && y > 230 ? available++ : null;
        } else if (query.data == "Проспект Червоної калини") {
          y > 420 ? available++ : null;
        }
        if (available > 0) {
          bot.sendMessage(idUser, `${query.data}На місці!`);
          displayed++;
          available--;
        }
      }
    });
  });
  if (displayed) {
    bot.sendMessage(idUser, `Біля ${query.data} Нема!`);
  }
});

bot.on("message", msg => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Дай Боже");
});
