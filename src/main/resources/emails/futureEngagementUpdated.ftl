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
<p style="color:red; font-size:12px; font-weight: bold;" align="center"><i>Classification: ${SECURITY_BANNER_TEXT}</i></p>

Hi ${(report.author.name)!},<br><br>

<p>The date of your upcoming engagement, "<i>${report.intent}</i>", is today. We've changed this upcoming engagement 
into a draft engagement report. You can find and edit it by going to the "My drafts" on the "My reports" page, 
or by clicking here: <a href="${serverUrl}/reports/${report.id?c}">${serverUrl}/reports/${report.id?c}</a>.</p>

ANET Support Team
<#if SUPPORT_EMAIL_ADDR??>
  <br><a href="mailto:${SUPPORT_EMAIL_ADDR}">${SUPPORT_EMAIL_ADDR}</a>
</#if>

</body>
</html>
