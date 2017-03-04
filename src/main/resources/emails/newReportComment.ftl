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

<p>The following comment was added to your "${report.intent}" report by ${comment.author.rank!} ${comment.author.name}:</p>

<p><i>"${comment.text}"</i></p>

You can <a href="${serverUrl}/reports/${report.id?c}">view or reply to this comment by using this link</a>

Thanks,<br>
The ANET Team

</body>
</html>
