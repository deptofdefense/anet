<#-- @ftlvariable name="" type="mil.dds.anet.resources.HomeResource.HomeView" -->
<#import "application/layout.ftl" as application>
<@application.layout>

<div class="anet-page-head">
	<h1 class="pull-left" style="margin-top:0px!important;">Your ANET at a glance</h1>
	<div class="submit pull-right"><a href="/reports/new"><btn type="submit" value="Submit Report" class="btn btn-default pull-right">Submit Report</btn></a>
</div>
<h3>Unapproved Reports</h3>
<div class="anet-block__body">
	<table class="usa-table-borderless">
		<thead>
			<tr class="header">
				<th scope="col">Reporters</th>
				<th scope="col">Summary</th>
				<th scope="col">Submitted</th>
			</tr>
		</thead>
		<tbody>
		<#list context.myPending as report>
			<tr>
				<th scope="row">${report.author.firstName} ${report.author.lastName}</th>
				<td>${report.intent}</td>
				<td>${report.updatedAt.toString('dd MMM yyyy')}</td>
				<td><a href="/reports/${report.id}">[View]</a></td>
			</tr>
		</#list>
		<#list context.myApprovals as report>
			<tr>
				<th scope="row">${report.author.firstName} ${report.author.lastName}</th>
				<td>${report.intent}</td>
				<td>${report.updatedAt.toString('dd MMM yyyy')}</td>
				<td><a href="/reports/${report.id}">[View]</a></td>
			</tr>
		</#list>
		</tbody>
	</table>
</div>
<hr>
<div class="anet-page-head">
	<h1 style="margin-top:0;clear:both">ANET News and Updates</h1>
</div>

	<section class="anet-block">
		<div class="anet-block__title">
			<div class="pull-left">Daily Rollup</div>
			<div class="pull-right">November 14th,2016</div>
		</div>

		<div class="anet-block__body">
		<div class="anet-block__copy">
			Quisque dignissim sollicitudin dui, ac convallis lectus. Pellentesque metus dui, ultrices et dignissim tristique, luctus vestibulum nisi. Quisque facilisis egestas est, eget ultrices sapien. Nunc accumsan nulla ut vulputate faucibus.<br>Donec maximus eros at dui iaculis, vel tristique nulla scelerisque.
			</div>
			<table class="usa-table-borderless">
				<thead>
					<tr class="header">
						<th scope="col">Reporters</th>
						<th scope="col">Summary</th>
						<th scope="col">Submitted</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th scope="row">Gruuber ͐ Katz</th>
						<td>Statement adopted by the Continental Congress declaring independence from the British Empire.</td>
						<td>Yesterday</td>
					</tr>
					<tr>
						<th scope="row">Gruuber ͐ Katz</th>
						<td>Statement adopted by the Continental Congress declaring independence from the British Empire.</td>
						<td>Yesterday</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

</@application.layout>
