<#import "../application/layout.ftl" as application>
<@application.layout>
<h1>Listing Positions</h1>

<table>
<tr><th>id</th><th>name</th><th>Type</th><th>Organization</th></tr>
<#list list as position>
	<tr>
		<td><a href="/positions/${position.id}">${position.id}</a></td>
		<td>${position.name}</td>
		<td>${position.type}</td>
		<td>
			<#if position.organization?? >
				<a href="/organizations/${position.organization.id}">${position.organization.name}</a>
			</#if>
		</td>
	</tr>
</#list>
</table>
<a href="/positions/new">[Create New Position]</a>

</@application.layout>