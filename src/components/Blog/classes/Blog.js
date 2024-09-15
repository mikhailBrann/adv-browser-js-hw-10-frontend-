import Widget from "./Widget";
import Request from "./Request";
import Validate from "./Validate.js";
import chatTemplate from "../template/chatTemplate.html";
import sendMessageForm from "../template/sendMessageForm.html";
import getCoordForm from "../template/getCoordForm.html";
import messageTemplate from "../template/messageTemplate.html";

export default class Blog {
    constructor(parentNode) {
        this.parentNode = parentNode ?? document.body;
        this.request = new Request();
        this.position = {};

        //init
        this.initBlog();
    }

    initBlog() {
        this.blogWidget = new Widget("blog__container", chatTemplate);
        this.parentNode.append(this.blogWidget.element);

        const postFormTemplate = sendMessageForm.replaceAll('{{class}}', 'blog');
        this.sendPostFormWidget = new Widget("blog__send-post-form", postFormTemplate);
        this.messageListWidget = new Widget("blog__messages", "");

        this.blogWidget.element.querySelector(".blog__view").insertAdjacentElement("beforeend", this.messageListWidget.element);
        this.blogWidget.element.querySelector(".blog__view").insertAdjacentElement("beforeend", this.sendPostFormWidget.element);
        this._renderPosts();

        //events
        this.sendPostFormWidget.element.querySelector("form input[name=message]").addEventListener("keydown", this.sendPost.bind(this));
    }

    async getPosts() {
        const postsRequest = this.request.send(false, 'GET', '/posts');
        const posts = await postsRequest;
        const data = await posts.json();

        return data;
    }

    async sendPost(event) {
        if(event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();

            if(event.target.value.trim() == '') {
                return;
            }

            const mess = event.target.value.trim();

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const textPost = {
                        mess,
                        date: this._getDate(),
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    }
        
                    this.request.send({ textPost }, 'POST', '/sendPost').then(() => {
                        this._renderPosts();
                    });
                },
                (error) => {
                    const formWidget = new Widget("coordinate-form__container", getCoordForm.replaceAll('{{class}}', 'coordinate-form').replace('{{messText}}', mess));
                    const form = formWidget.element.querySelector("form");
                    const resetBtn = formWidget.element.querySelector("[type=reset]");

                    resetBtn.addEventListener("click", this._removeCoordForm.bind(this, event, formWidget.element));
                    form.addEventListener("submit", this._sendCoordForm.bind(this));

                    document.body.append(formWidget.element);
                }
            );
        }
    }

    _sendCoordForm(event) {
        event.preventDefault();
        const form = event.target;
        const resetBtn = form.querySelector("[type=reset]");
        const mess = form.querySelector("input[name=messText]").value;
        const coordinate = event.target.querySelector("input[name=coordinate]").value;

        try {
            const { latitude, longitude } = Validate.coordinate(coordinate);
            const textPost = {
                mess,
                date: this._getDate(),
                lat: latitude,
                lon: longitude
            }

            this.request.send({ textPost }, 'POST', '/sendPost').then(() => {
                this._renderPosts();
                resetBtn.click();
            });
        } catch (error) {
            const errorMessage = event.target.querySelector(".form__err");
            const submitBtn = event.target.querySelector("[type=submit]");

            submitBtn.disabled = true;
            errorMessage.textContent = error.message;

            setTimeout(() => {
                submitBtn.disabled = false;
                errorMessage.textContent = '';
            }, 3000);
        }
    }

    _removeCoordForm(event, element) {
        event.preventDefault();
        element.remove();
    }

    _getDate() {
        const now = new Date();
        return `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    }

    async _renderPosts() {
        this.messageListWidget.element.innerHTML = '';

        const postsObj = await this.getPosts();
        const { posts } = postsObj;

        posts.forEach(post => {
            const messageTemplateContent = messageTemplate.replace('{{content}}', post.mess).replace('{{date}}', post.date).replace('{{coord}}', `[${post.lat}, ${post.lon}]`);
            this.messageListWidget.addElement(messageTemplateContent);
        });

        //скролим в конец чата при его ренедере
        this.messageListWidget.element.scrollTop = this.messageListWidget.element.scrollHeight;
    }
}