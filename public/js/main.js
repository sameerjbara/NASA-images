
(function () {

  let NASA_URL_se = "https://api.nasa.gov/planetary/apod?api_key=8vd0nraK2lawpMpxNryDou5aRV5VqqU9IdAsHdLu&"

  let startDate;

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   * domcontentloaded that handles the event lsiteneres after making sure the dom is ready
   */

  document.addEventListener("DOMContentLoaded", function () {
    setDefaultImages()
    const container = document.querySelector('#grid');
    document.getElementById("form-submit").addEventListener("click", setRequestedImages);
    document.getElementById("moreButton").addEventListener("click", setMoreImages);
    container.addEventListener('click', handleComment);

    setInterval(updateComments, 15000)//call the polling function each 15 seconds

  });

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function that handles the polling, each 15 seconds it requests all the comments from our api
   */
  function updateComments() {
    const commentSection = document.getElementsByName("theForm")
    commentSection.forEach(post => {
      getALlComments(post.getAttribute("id"))
    })
  }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  /**
   * this function is used to show the first 3 images from the current date, before the user chooses a date
   */
  function setDefaultImages() {
    let date = new Date();
    let url = generateUrl(date)
    getDataFromNasa(url)
  }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function fetches the necessary data from nasa in order to show on our feed using the appropriate url
   * @param url //this param is the appropriate url for getting the images of a given date
   */
  function getDataFromNasa(url) {
    const displayError = document.getElementById("error-box")//error box used to display errors for user
    const date = document.getElementById("date-input").value
    const anime = document.getElementById('loading-gif');//loading animation
    let nasaError = false;//boolean value to check if the error is from NASA's api
    fetch(url)
        .then(res => res.json())
        .then(json => {
          if (400 <= json.status && json.status <= 499) {//generic if statement for all the 400 errors from nasa
            nasaError = true
            throw new Error(json.message)
          }
          anime.classList.add('d-none')
          displayError.classList.add('d-none');
          createImgGrid(json)
        })
        .catch(function (err) {
          anime.classList.add('d-none')
          if (date === "") {
            displayError.innerHTML = `please enter a date`
            displayError.classList.remove('d-none');
          } else if (nasaError) {
            displayError.innerHTML = err
            displayError.classList.remove('d-none');
          } else {
            displayError.innerHTML = `${date} is not a valid date`
            displayError.classList.remove('d-none');
          }
        });
  }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function sets the chosen date by the user, fits it properly into the url and calls a function to get the data
   * @param event //the date chosen by a user
   */
  function setRequestedImages(event) {
    event.preventDefault();
    displayLoading()
    const date = document.getElementById("date-input")
    let url = generateUrl(date.value)
    document.getElementById("grid").innerHTML = " "
    getDataFromNasa(url)
  }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function displays the loading gif until the fetch is complete
   */
  function displayLoading() {
    const anime = document.getElementById('loading-gif');
    anime.classList.remove('d-none')
  }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function creates the appropriate url that is used to fetch the data from nasa
   * @param date //the current date or the date chosen by a user
   * @returns {string} //returns the url
   */
  function generateUrl(date) {

    let endDate = new Date(date);
    startDate = new Date(date);
    startDate.setDate(endDate.getDate() - 2);

    let myUrl = NASA_URL_se + `start_date=${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}&end_date=${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`;
    return myUrl;
  }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function is used after a user clicked the more button which fetches three more images after the last date presented
   */
  function setMoreImages() {
    displayLoading()
    startDate.setDate(startDate.getDate() - 1);
    let url = generateUrl(startDate)
    getDataFromNasa(url)
  }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function sends request to the server in order to add comment to the post
   * @param date the date of the post/image
   */
  async function sendComment(date) {
    let validError = false
    const commentBox = document.getElementById(`box ${date}`).value //the box where the comment will be displayed
    const errorMsg = document.getElementById('error-box') // error box to display to user if found
    const box = document.getElementById(`box ${date}`)
    box.removeAttribute("class")
    box.setAttribute("class", "form-control")
    errorMsg.classList.add('d-none')//remove an error if there was one before
    document.getElementById(`box ${date}`).value = ""
    await fetch("/admin/feed",
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            "comment": commentBox, "id": date
          })
        }).then(res => res.json())
        .then(json => {
          if (json.sessionExpired === "no user")//check if the session expired and display it
          {
            window.location.href = "/"

          } else {
            return json
          }
        })
        .then(json => {
          if (Object.keys(json).length !== 0) {//check if the json obj is empty or not
            validError = true
            throw new Error(json.errors[0].message)//if empty throw error
          }
        }).catch(err => {
          if (validError) {
            errorMsg.classList.remove('d-none')
            errorMsg.innerHTML = err
          }
        });
    getALlComments(date)
  }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function shows and Hides the description of each image
   * @param date the date of the image
   */
  function showHide(date) {
    const desc = document.getElementById(`toggle-desc ${date}`)
    desc.classList.toggle("d-none")
  }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function send request the server in order to delete a comment
   * @param date the date of the image that the comment belongs to
   * @param id the id of the comment
   */
  function deleteComment(id, date) {
    const errorMsg = document.getElementById('error-box')//error box to display for user if found
    fetch('/admin/feed/' + id, {
      method: 'DELETE',
    }).then(res => res.json())
        .then(res => {
          if (res.msg === "error") {//check if theres an error returned
            throw new Error("deleting comment failed")
          } else {
            errorMsg.classList.add('d-none')
          }
        })
        .then(res => {
          if (res.status === 409)
            throw res
        }).catch(function (error) {
      errorMsg.classList.remove('d-none')
      errorMsg.innerHTML = error

    });
    getALlComments(date)
  }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function handles events such as addComment,deleteComment,showHideDescription
   * @param event
   */
  function handleComment(event) {
    event.preventDefault();
    let eventId = event.target.getAttribute("id")
    if (eventId !== null) {
      let type = eventId.split(" ")[0]
      let date = eventId.split(" ")[1]
      if (type === "btn") {
        sendComment(date)
      } else if (type === "desc") {
        showHide(date)
      } else if (/^[0-9]*$/.test(type)) {
        deleteComment(type, date)
      }
    }
  }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function fetches all the comments in our server and displays them
   * @param id the id of the comment which is the date of the image
   */
  function getALlComments(id) {
    const errorMsg = document.getElementById('error-box')
    const comments = document.getElementById(`d ${id}`)
    let index = 1//comment counter
    fetch(`/admin/feed/${id}`)

        .then(res => res.json())
        .then(json => {
          if (json.sessionExpired === "no user")//check if session is expired
          {
            window.location.href = "/"
          } else {
            return json
          }
        })
        .then(function (data) {
          // errorMsg.classList.add('d-none')
          let html = "Comment Section (empty and longer than 128 chars comments won't be published):  <ul>";

          data.forEach(function (item) {
            html += `<div class = "row">
                        <div class = "col text-start">
                            <div class="overflow-y-auto bg-light" id = "${id} close">
                                <li class = "text-break">${index} <code>${item.userName}</code>:- ${item.comment}
                                </li><br >
                            </div>
                        </div>`

            let htmlDelete = `<div class ="col text-end">
                                    <div class="container ">
                                        <button class="btn-close text-end" type="submit" id="${item.sqlId} ${id}"></button>
                                    </div>
                                 </div>`
            if (item.email === item.currentEmail) {
              html += htmlDelete//add a delete button for that user
            }
            html += `</div>`
            index += 1

          });
          html += "</ul>";
          comments.innerHTML = html;

        })
        .catch(function (error) {
          errorMsg.classList.remove('d-none')
          errorMsg.innerHTML = error
        });
  }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function creates the feed using bootstrap grids, giving each element its specific features in order to
   * display the feed responsively
   * @param data is the object we get from nasa for the images.
   */
  function createImgGrid(data) {
    const grid = document.getElementById("grid")

    data.slice().reverse().forEach(post => {
      const newRow = createNewRow()

      const firstCol = createFirstCol()

      const postImage = createPostImage(post);

      const secondCol = createSecondCol()

      const showMore = createShowMore(post)

      const postDesc = createPostDesc(post)

      const newR1 = createNewR1()

      const postCreator = createPostCreator(post)

      const postdate = createPostDate(post)

      const postTitle = createPostTitle(post)

      const newR2 = document.createElement("div")

      const newR21 = createNewR21(post)

      const newR22 = createNewR22()
      const date = post.date

      const formAct = createFormAct(date)


      const commentSec = createCommentSec(date)

      const commentError = createCommentError()

      const commentBox = createCommentBox(date)

      const submitb = createSubmitB(date)

      firstCol.appendChild(postImage)

      newR1.appendChild(postdate)
      newR1.appendChild(postTitle)
      newR1.appendChild(postDesc)
      newR1.appendChild(showMore)
      newR1.appendChild(postCreator)

      commentSec.appendChild(commentBox)
      commentSec.appendChild(commentError)
      commentSec.appendChild(submitb)

      formAct.appendChild(commentSec)

      newR22.appendChild(formAct)
      newR2.appendChild(newR21)
      newR2.appendChild(newR22)

      secondCol.appendChild(newR1)
      secondCol.appendChild(newR2)

      newRow.appendChild(firstCol)
      newRow.appendChild(secondCol)

      grid.appendChild(newRow)

      getALlComments(date)

    })
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * create the first col of our grid
   * @returns {HTMLDivElement}
   */
  function createFirstCol() {
    const firstCol = document.createElement("div")
    firstCol.setAttribute("class", "col-6 aligns-items-center justify-content-center")
    return firstCol;
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function creates a html element that holds the image from nasa, it first checks if the media is an image or a
   * video type and provides the appropriate html tags for it
   * @param post the object returned from nasa
   * @returns {HTMLIFrameElement | HTMLImageElement}
   */
  function createPostImage(post) {
    let postImage
    if (post.media_type === "image") {
      postImage = document.createElement("img")
    } else {
      postImage = document.createElement("iframe")
    }
    postImage.setAttribute("src", post.url)
    postImage.setAttribute("class", "img-thumbnail")
    postImage.setAttribute("height", "300")
    postImage.setAttribute("alt", "")
    return postImage
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * create the first row for the grid that will hold two cols, the first and second col
   * @returns {HTMLDivElement}
   */
  function createNewRow() {
    let newRow = document.createElement("div")
    newRow.setAttribute("class", "row")
    return newRow;
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function creates our second col in the grid
   * @returns {HTMLDivElement}
   */
  function createSecondCol() {
    let secondCol = document.createElement("div")
    secondCol.setAttribute("class", "col-6")
    return secondCol;
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function creates the show/more button for the description that either hides or shows it
   * @param post
   * @returns {HTMLButtonElement}
   */
  function createShowMore(post) {
    let showMore = document.createElement("button")
    showMore.setAttribute("class", "btn btn-secondary")
    showMore.setAttribute("id", `desc ${post.date}`)
    showMore.innerHTML = "show/hide media Description"
    return showMore
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function creates an html element for the post description found on the second col
   * @param post
   * @returns {HTMLDivElement}
   */
  function createPostDesc(post) {
    let hasDesc = post.hasOwnProperty('explanation')
    let postDesc = document.createElement("div")
    postDesc.setAttribute("id", `toggle-desc ${post.date}`)
    if (hasDesc) {
      postDesc.innerHTML = `Description: ${post.explanation}`
      postDesc.setAttribute("class", "bg-light")
    } else {
      postDesc.innerHTML = "post has no description"
    }
    return postDesc
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * this row will hold the comment box that displays the comments of all the users for a specific image
   * @returns {HTMLDivElement}
   */
  function createNewR1() {
    let newR1 = document.createElement("div")
    newR1.setAttribute("class", "row")
    return newR1
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * this element created is used for the date of the image displayed
   * @param post
   * @returns {HTMLParagraphElement}
   */
  function createPostDate(post) {
    let postDate = document.createElement("p")
    postDate.innerHTML = `Date - ${post.date}`
    return postDate
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * this element created is used to displayed the creator of the image if found
   * @param post
   * @returns {HTMLParagraphElement}
   */
  function createPostCreator(post) {
    let postCreator = document.createElement("p")
    let hasCopyright = post.hasOwnProperty('copyright')
    if (hasCopyright) {
      postCreator.innerHTML = `Created By: ${post.copyright}`
    } else {
      postCreator.innerHTML = "post has no copyright "
    }
    return postCreator
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * the element created used to show the title of a specific image
   * @param post
   * @returns {HTMLParagraphElement}
   */
  function createPostTitle(post) {
    let postTitle = document.createElement("p")
    postTitle.innerHTML = `title: ${post.title}`
    return postTitle;
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function creates a row for the comments
   * @param post
   * @returns {HTMLDivElement}
   */
  function createNewR21(post) {
    let newR21 = document.createElement("div")
    newR21.setAttribute("class", "row overflow-auto bg-light")
    newR21.setAttribute("id", `d ${post.date}`)
    newR21.setAttribute("style", "height: 200px;")
    return newR21
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function creates an element that allows the user to write comments
   * @returns {HTMLDivElement}
   */
  function createNewR22() {
    let newR22 = document.createElement("div")
    newR22.setAttribute("class", "row")
    return newR22

  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function creates a form element with action and method
   * @param date
   * @returns {HTMLFormElement}
   */
  function createFormAct(date) {
    let formAct = document.createElement("form")
    formAct.setAttribute("action", "/admin/feed")
    formAct.setAttribute("method", "post")
    formAct.setAttribute("id", `${date}`)
    formAct.setAttribute("name", "theForm")
    formAct.setAttribute("class", "foorm")
    return formAct
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function creates a comment section element
   * @param date
   * @returns {HTMLDivElement}
   */
  function createCommentSec(date) {
    let commentSec = document.createElement("div")
    commentSec.setAttribute("id", `sec ${date}`)
    return commentSec
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function creates an error box for errors to display
   * @returns {HTMLDivElement}
   */
  function createCommentError() {
    let commentError = document.createElement("div")
    commentError.setAttribute("class", "invalid-feedback")
    commentError.innerHTML = "comments should not be empty or longer than 128 char"
    return commentError
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * this function creates a comment box for each comment
   * @param date
   * @returns {HTMLInputElement}
   */
  function createCommentBox(date) {
    let commentBox = document.createElement("input")
    commentBox.setAttribute("class", "form-control")
    commentBox.setAttribute("name", "box")
    commentBox.setAttribute("id", `box ${date}`)
    return commentBox
  }

//~~~~~~~~~~~~~~~~~~~~~
  /**
   * this ufnction creates a submit button for comments
   * @param date
   * @returns {HTMLInputElement}
   */
  function createSubmitB(date) {
    let submitb = document.createElement("input")
    submitb.setAttribute("type", "submit")
    submitb.setAttribute("class", "btn btn-primary mr-2")
    submitb.setAttribute("name", "sub")
    submitb.setAttribute("id", `btn ${date}`)
    return submitb
  }


})()
