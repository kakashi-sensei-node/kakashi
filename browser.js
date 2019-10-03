function itemTemplate(items) {
  return `
    <li class="list-group-item list-group-item-action d-flex align-items-center shadow-lg justify-content-between list-here">
      <span class="item-text">${items.text}</span>
        <div>
        <button data-id="${items._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
        <button data-id="${items._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
        </div>
    </li>
  `
}

//initial page render
let ourHTML = items.map(function(item) {
  return itemTemplate(item)
}).join("")
document.getElementById("list-field").insertAdjacentHTML("beforeend", ourHTML)

//create-items
let item = document.getElementById("item-field")

document.getElementById("form-field").addEventListener("submit", function(e) {
  e.preventDefault()
  if(item.value) {
    axios.post("/create-item", {text: item.value}).then(function(response) {
      document.getElementById("list-field").insertAdjacentHTML("beforeend", itemTemplate(response.data))
      item.value=""
      item.focus()
    }).catch(function() {
      console.log("Please try again later.")
    })
  }
})

document.addEventListener("click", function(e) {
    //update-items
    if (e.target.classList.contains("edit-me")) {
      let userInput = prompt("Enter your desired new text: ", e.target.parentElement.parentElement.querySelector(".item-text").innerHTML)
      if (userInput) {
        axios.post("/update-item", {text: userInput, id: e.target.getAttribute("data-id")}).then(function() {
          e.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput
        }).catch(function() {
          console.log("Please try again later.");
        })
      }
    }

    //delete-items
    if (e.target.classList.contains("delete-me")) {
      if (confirm("Do you really want to permanantly delete this item?")) {
        axios.post("/delete-item", {id: e.target.getAttribute("data-id")}).then(function() {
          e.target.parentElement.parentElement.remove()
        }).catch(function() {
          console.log("Please try again later.");
        })
      }
    }
})
