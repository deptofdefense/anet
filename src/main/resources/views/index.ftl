<#-- @ftlvariable name="" type="mil.dds.anet.resources.HomeResource.HomeView" -->
<#include "template/header.ftl">
<div class='anet-top-block'>
	<h1>Your ANET at a Glance</h1>
	<b>You are: ${context.currentUser}</b><br>
	<#list context.myApprovals>
		<h3>Reports Pending your Approvall</h3>
		<table>
		<tr><th>Date</th><th>Author</th><th>Summary</th></tr>
		<#items as report>
			<tr>
				<td>${report.engagementDate}</td>
				<td>${report.author.firstName} ${report.author.lastName}</td>
				<td>${report.intent}</td>
				<td><a href="/reports/${report.id}">[View]</a></td>
			</tr>
		</#items>
		</table>
	</#list>
	
	<#list context.myPending>
		<h4>Your Reports Pending Approval</h4>
		<table>
		<tr><th>Date</th><th>Summary</th></tr>
		<#items as report>
			<tr>
				<td>${report.engagementDate}</td>
				<td>${report.intent}</td>
				<td><a href="/reports/${report.id}">[View]</a></td>
			</tr>
		</#items>
		</table>
	</#list>
		
	
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
</div>
<#include "template/footer.ftl">