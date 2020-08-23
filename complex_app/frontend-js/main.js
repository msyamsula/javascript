import Search from "./moddule/search";
import Chat from "./moddule/chat";

if (document.querySelector(".header-chat-icon")) {
  new Chat();
}

if (document.querySelector(".header-search-icon")) {
  new Search();
}
