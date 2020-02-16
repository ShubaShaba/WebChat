let chat = "globalChat.json";
let user = "Sbub";

let field = document.getElementById("field");
let textBar = document.getElementById("textBar");

function addUpdate(text) {
	let field = document.getElementById("field");

	let element = document.createElement("p");
	let content = document.createTextNode(text);

	element.appendChild(content);
	field.appendChild(element);
}

function polling() {
	let xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;

		if (this.status == 200) {
			addUpdate(this.responseText);
		} else {
			console.log(this);
		}

		polling();
	};
	xhr.open(
		"GET",
		`http://192.168.1.146:8081/realtimeUpdate?chat=${chat}`,
		true,
	);
	xhr.send();

	xhr.addEventListener("error", e => {
		console.log(e);
	});
}

function sendMessage() {
	let value = textBar.value;
	let xhr = new XMLHttpRequest();

	if (value) {
		xhr.open(
			"GET",
			`http://192.168.1.146:8080/addMessage?message=${value}&from=${user}&chat=${chat}`,
			true,
		);
		xhr.send();

		xhr.addEventListener("error", e => {
			console.log(e);
		});
	}
}

setTimeout(polling, 1000);
