const DOMPurify = require("dompurify");

export default class Chat {
  constructor() {
    this.isOpen = 0;
    this.chatWrapper = document.querySelector("#chat-wrapper");
    this.injectHTML();
    this.chatIcon = document.querySelector(".header-chat-icon");
    this.chatLog = document.querySelector(".chat-log");
    this.closeChatIcon = document.querySelector(".chat-title-bar-close");
    this.chatField = document.querySelector("#chatField");
    this.chatForm = document.querySelector("#chatForm");
    this.events();
  }

  events() {
    this.chatIcon.addEventListener("click", () => this.openChat());
    this.closeChatIcon.addEventListener("click", () => this.closeChat());
    this.chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendMessage();
    });
  }

  sendMessage() {
    this.socket.emit("chatMessageFromBrowser", {
      message: this.chatField.value,
    });
    this.chatLog.insertAdjacentHTML(
      "beforeend",
      DOMPurify.sanitize(`<div class="chat-self">
    <div class="chat-message">
      <div class="chat-message-inner">
        ${this.chatField.value}
      </div>
    </div>
    <img
      class="chat-avatar avatar-tiny"
      src="${this.avatar}"
    />
  </div>`)
    );
    this.chatField.value = "";
    this.chatField.focus();
    this.chatLog.scrollTop = this.chatLog.scrollHeight;
  }

  openChat() {
    if (!this.isOpen) {
      this.openConnection();
    }
    this.isOpen = 1;
    this.chatWrapper.classList.add("chat--visible");
    setTimeout(this.chatField.focus(), 100);
  }

  openConnection() {
    this.socket = io();
    this.socket.on("welcome", (data) => {
      this.username = data.username;
      this.avatar = data.avatar;
    });
    this.socket.on("chatMessageFromServer", (data) => {
      this.displayMessageFromServer(data);
    });
  }

  displayMessageFromServer(data) {
    this.chatLog.insertAdjacentHTML(
      "beforeend",
      DOMPurify.sanitize(
        `<div class="chat-other">
      <a href="/profile/${data.session.username}"
        ><img
          class="avatar-tiny"
          src="${data.session.avatar}"
      /></a>
      <div class="chat-message">
        <div class="chat-message-inner">
          <a href="#"><strong>${data.session.username}:</strong></a>
          ${data.message}
        </div>
      </div>
    </div>`
      )
    );
    this.chatLog.scrollTop = this.chatLog.scrollHeight;
  }

  closeChat() {
    this.chatWrapper.classList.remove("chat--visible");
  }

  injectHTML() {
    this.chatWrapper.innerHTML = DOMPurify.sanitize(`
    <div class="chat-title-bar">
        Chat
        <span class="chat-title-bar-close"><i class="fas fa-times-circle"></i></span>
    </div>
    <div id="chat" class="chat-log"></div>
    <form id="chatForm" class="chat-form border-top">
    <input
        type="text"
        class="chat-field"
        id="chatField"
        placeholder="Type a message…"
        autocomplete="off"
    />
    </form>
    `);
  }
}
