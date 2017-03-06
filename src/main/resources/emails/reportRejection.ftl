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
Hi, ${report.author.name},

<p>Your report "<i>${report.intent}</i>" has been rejected by ${rejector.name}. The following comment was provided:</p>
<p>"${comment.text}"</p>

<p>You can edit and re-submit your report by <a href="${serverUrl}/reports/${report.id?c}">clicking here</a>.</p>

Thanks,<br>
The ANET team
</body>
</html>
