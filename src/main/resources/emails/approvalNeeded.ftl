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
Dear ${approvalStepName},
<br><br>
<div>${report.author.name}'s report, <i>${report.intent}</i>, is ready for your review. You can <a href="${serverUrl}/reports/${report.id?c}" />review the report using this link</a>.</div>
<br>
<b>Key outcomes:</b> ${report.keyOutcomes!}<br>
<b>Next steps:</b> ${report.nextSteps!}<br>
<b>Details:</b> ${report.reportText!}<br>
<br>
<#if report.cancelledReason??>
<b>This report was CANCELLED for: ${report.cancelledReason}</b><br><br>
</#if>

Thank you,<br>
The ANET Team

</body>
</html>
