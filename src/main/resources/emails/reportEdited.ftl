<html>
<style type="text/css">
body {
	font-family: Arial, Helvetica, SourceSansPro-Regular;
	color: #000000;
	font-size: 11px
}
h1 {
	font-size: 20px
}
h2 {
	font-size: 16px;
}

a {
	color:#0072BD;
}
</style>
<body>
Hello ${report.author.name},

<p>${editor.name} edited your report "${report.intent}". To review the changes, <a href="${serverUrl}/reports/${report.id?c}">click here</a>.</p>

Thanks!<br>
The ANET Team
</body>
</html>