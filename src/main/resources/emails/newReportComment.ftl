<html>
<body>
Hello ${report.author.name},

<p>${comment.author.rank!} ${comment.author.name} added a comment to your report "${report.intent}".
To view or reply to the comment, <a href="${serverUrl}/reports/${report.id?c}">click here</a>.

<p>${comment.text}</p>

Thanks!<br>
The ANET Team

</body>
</html>
