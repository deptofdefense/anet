<#-- @ftlvariable name="" type="mil.dds.anet.resources.HomeResource.HomeView" -->
<#include "template/header.ftl">
<h1>Hello <strike>World</strike>ANET!</h1>
<b>You are: ${context.currentUser}</b><br>
<b>Here are the things you can do:</b>
<ul>
	<li><a href="/reports/" >Reports</a></li>
	<li><a href="/people/" >People</a></li>
	<li><a href="/billets/" >Billets</a></li>
	<li><a href="/tashkils/" >Tashkils</a></li>
	<li><a href="/poams/" >POAMs</a></li>
	<li><a href="/advisorOrganizations/" >Advisor Organizations</a></li>
	<li><a href="/groups/" >Groups</a></li>
</ul>

<#include "template/footer.ftl">