let naam = document.getElementById("naam")
let wachtwoord = document.getElementById("wachtwoord")

let submitHandler = () => {
    const xhr = new XMLHttpRequest()
    let succes = false
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(xhr.response)
            succes = JSON.parse(xhr.response)
        }
    }

    xhr.open("POST", "/check", false)
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    xhr.send(JSON.stringify({naam: naam.value, wachtwoord: wachtwoord.value}))
    return succes
}