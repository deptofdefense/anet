<html>
<body>
Hello ${report.author.name},

<p>Your report <i>${report.intent}</i> has been rejected by ${rejector.name}  with the comment:</p>
<p>${comment.text}</p>

<p>You can edit and re-submit your report by <a href="${serverUrl}/reports/${report.id?c}">clicking here</a>.</p>

</body>
</html>
