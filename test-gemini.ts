import { askGeminiBot } from "./lib/whatsapp-gemini";

async function main() {
  try {
    const res = await askGeminiBot("Mansa x and other special funds", {
      name: "Edwin",
      userId: "123",
      isPremium: true
    }, "254726260884");
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}

main();
