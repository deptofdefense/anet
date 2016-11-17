<#import "../application/layout.ftl" as application>
<@application.layout>

<h1>Listing Tashkils</h1>

<table>
<tr><th>id</th><th>name</th><th>Code</th></tr>
<#list list as tashkil>
	<tr>
		<td><a href="/tashkils/${tashkil.id}">${tashkil.id}</a></td>
		<td>${tashkil.name}</td>
		<td>${tashkil.code}</td>
	</tr>
</#list>
</table>
<a href="/tashkils/new">[Create New Tashkil]</a>

</@application.layout>
