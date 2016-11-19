<#import "../application/layout.ftl" as application>
<@application.layout>

<h1>Listing Organizations</h1>
<a href="/organizations/new">[Create New]</a>
<table>
<tr><th>id</th><th>name</th><th>Type</th></tr>
<#list list as org>
	<tr>
	<td><a href="/organizations/${org.id}">${org.id}</a></td>
	<td>${org.name}</td>
	<td>${org.type}</td>
	<td><a href="/organizations/${org.id}/edit">[Edit]</a></td>
</#list>
</table>
</@application.layout>