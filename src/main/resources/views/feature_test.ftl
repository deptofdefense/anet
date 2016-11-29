<!DOCTYPE html>
<html lang="en">
<head>
	<title>ANET Feature Test</title>
	<script src="/assets/js/modernizr-custom.min.js"></script>
</head>
<body>
	<form id="form">
		<label for="name">Please enter your name:</label>
		<input type="text" id="name">
		<input type="submit" value="Submit">
	</form>
	<script>
		function submitTelemetry(userName) {
			var info = {};
			info.user_name = userName;
			info.user_agent = navigator.userAgent;
			info.size = {width: window.innerWidth, height: window.innerHeight};
			info.features = Modernizr;

			var request = new XMLHttpRequest();
			request.addEventListener('load', function() {
				if (this.readyState === 4) {
					if (this.status === 200) {
						document.write('<p>Feature test completed successfully. Thank you!</p>');
						document.write(this.responseText);
					} else {
						document.write('There was an error running the test. Would you mind trying again? If this continues, please let the ANET team know. Thank you!');
					}
				}
			});
			request.open('POST', '/testing/features');
			request.setRequestHeader('Content-Type', 'application/json');
			request.send(JSON.stringify(info));
		}

		document.getElementById('form').addEventListener('submit', function(event) {
			var userName = document.getElementById('name').value;
			submitTelemetry(userName);
			event.stopPropagation();
			event.preventDefault();
		});
	</script>
</body>
</html>
