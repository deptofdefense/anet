export default {
	fetch(url) {
		return fetch(url, {
			credentials: "same-origin",
			headers: {
				"Accept": "application/json"
			}
		}).then(response => response.json())
		  .then(function(data) {
			  console.log(data);
			  return data;
		  })
	},

	send(url, data) {
		return fetch(url, {
			method: "POST",
			body: JSON.stringify(data),
			credentials: "same-origin",
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",

			}
		}).then(response => response.json())
	}
}
