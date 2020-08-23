import axios from "axios";
import DOMPurify from "dompurify";

export default class Search {
  // 1. property to select DOM element, and keep track any useful data
  constructor() {
    this.injectHTML();
    this.headerSearchIcon = document.querySelector(".header-search-icon");
    this.overlay = document.querySelector(".search-overlay");
    this.closeLiveSearch = document.querySelector(".close-live-search");
    this.inputField = document.querySelector("#live-search-field");
    this.resultsArea = document.querySelector(".live-search-results");
    this.loaderIcon = document.querySelector(".circle-loader");
    this.typingWaitTimer;
    this.previousValue = "";
    this.events();
  }

  // 2. Events
  events() {
    this.headerSearchIcon.addEventListener("click", () => {
      // e.preventDefault();
      this.openOverlay();
    });

    this.closeLiveSearch.addEventListener("click", () => {
      // e.preventDefault();
      this.closeOverlay();
    });

    this.inputField.addEventListener("keyup", () => this.keyPressHandler());
  }

  // 3. Methods
  openOverlay() {
    this.overlay.classList.add("search-overlay--visible");
    setTimeout(() => this.inputField.focus(), 50);
  }

  closeOverlay() {
    this.overlay.classList.remove("search-overlay--visible");
  }

  keyPressHandler() {
    let value = this.inputField.value;

    if (value == "") {
      clearTimeout(this.typingWaitTimer);
      this.hideLoaderIcon();
      this.hideResultsArea();
    }

    if (value != "" && value != this.previousValue) {
      clearTimeout(this.typingWaitTimer);
      this.showLoaderIcon();
      this.hideResultsArea();
      this.typingWaitTimer = setTimeout(() => {
        this.sendRequest();
      }, 750);
    }
    this.previousValue = value;
  }

  showLoaderIcon() {
    this.loaderIcon.classList.add("circle-loader--visible");
  }

  sendRequest() {
    // new Promise(async (resolve, reject) => {
    //   try {
    //     let resp = await axios.post("/search", { text: this.inputField.value });
    //     console.log(resp.data);
    //     this.renderResultsHTML(resp.data);
    //     resolve();
    //   } catch (err) {
    //     reject();
    //   }
    axios
      .post("/search", { text: this.inputField.value })
      .then((resp) => {
        console.log(resp.data);
        this.renderResultsHTML(resp.data);
      })
      .catch((err) => {
        alert("err");
      });
    // });
  }

  renderResultsHTML(posts) {
    if (posts.length) {
      this.resultsArea.innerHTML = DOMPurify.sanitize(`<div class="list-group shadow-sm">
      <div class="list-group-item active">
        <strong>Search Results</strong> (${posts.length} item${
        posts.length > 1 ? "s" : ""
      } found)
      </div>
      ${posts
        .map((post) => {
          let postDate = new Date(post.created_at);
          let day = postDate.getDate();
          let month = postDate.getMonth();
          let year = postDate.getFullYear();
          return `<a href="/post/${post._id}" class="list-group-item list-group-item-action">
        <img
          class="avatar-tiny"
          src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128"
        />
        <strong>${post.title}</strong>
        <span class="text-muted small">by barksalot on ${day}/${month}/${year}</span>
      </a>`;
        })
        .join("")}`);
    } else {
      this.resultsArea.innerHTML = DOMPurify.sanitize(
        `<p class="alert alert-danger text-center shadow-sm" >Sorry, we could not find any result for that search<p>`
      );
    }

    this.hideLoaderIcon();
    this.showResultsArea();
  }

  hideLoaderIcon() {
    this.loaderIcon.classList.remove("circle-loader--visible");
  }

  showResultsArea() {
    this.resultsArea.classList.add("live-search-results--visible");
  }

  hideResultsArea() {
    this.resultsArea.classList.remove("live-search-results--visible");
  }

  injectHTML() {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<!-- search feature begins -->
      <div class="search-overlay">
        <div class="search-overlay-top shadow-sm">
          <div class="container container--narrow">
            <label for="live-search-field" class="search-overlay-icon"
              ><i class="fas fa-search"></i
            ></label>
            <input
              type="text"
              id="live-search-field"
              class="live-search-field"
              placeholder="What are you interested in?"
            />
            <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
          </div>
        </div>
      
        <div class="search-overlay-bottom">
          <div class="container container--narrow py-3">
            <div class="circle-loader"></div>
            <div class="live-search-results"></div>
          </div>
        </div>
      </div>
      <!-- search feature end -->
    `
    );
  }
}
