<!DOCTYPE html>
<html lang="en">
<head>
	<title>ANET Feature Test</title>
	<script src="/assets/js/modernizr-custom.min.js"></script>
</head>
<body>
	<script>
		var features = JSON.stringify(Modernizr);
		var request = new XMLHttpRequest();
		request.open('POST', '/testing/features');
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(features);
	</script>
</body>
</html>
