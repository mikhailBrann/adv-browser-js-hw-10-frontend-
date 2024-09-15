import Blog from "../components/Blog/classes/Blog.js";
import "../components/Blog/css/style.css";


document.addEventListener("DOMContentLoaded", () => {
  const parentNode = document.querySelector('.Frontend');
  const blog = new Blog(parentNode);
  
});
