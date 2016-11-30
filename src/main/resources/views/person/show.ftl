<#import "../application/layout.ftl" as application>
<@application.layout>

<div class="anet-page-head">
	<div class="pull-left"><h3 class="pull-left">${rank!} ${name}</h3></div>
	<div class="pull-right"><h3 class="pull-right">${status}</h3></div>
</div>
<br><br><br><!-- TODO: FIX THIS -->

<section class="anet-block">
	<div class="anet-block__title">
		${name}
		<div class="pull-right">
			<a href="/people/${id}/edit">[edit]</a>
		</div>
	</div>

	<div class="anet-block__body">
		<div class="row">
			<div class="col-md-6">
				<div class="field">
			 		<div class="header">Email</div>
			 		<div class="content"><a href="mailto:${emailAddress}">${emailAddress}</a></div>
		 		</div>
			 	<div class="field">
				 	<div class="header">Phone</div>
				 	<div class="content">${phoneNumber}</div>
				 </div>
				 <div class="field">
				 	<div class="header">Rank</div>
				 	<div class="content">${rank}</div>
				 </div>
				 <div class="field">
				 	<div class="header">Role</div>
				 	<div class="content">${role}</div>
				 </div>
				 <div class="field">
				 	<div class="header">Location</div>
				 	<div class="content"><#if location??>${location.name}</#if></div>
			 	</div>
			</div>
			<div class="col-md-6">
				<div class="field">
				${biography}
				</div>
			</div>
		</div>
	</div>
</section>
<#if role == "PRINCIPAL">
	<#assign positionName = "Tashkil">
	<#assign relatedPositionName = "Advisor">
<#else>
	<#assign positionName = "Billet">
	<#assign relatedPositionName = "Principal">
</#if>
<section class="anet-block">
	<div class="anet-block__title">
		${positionName}s held by this Person
	</div>
	 <div class="anet-block__body">
		<div class="row">
			<table>
				<thead>
					<tr>
						<th>Date</th>
						<th>Org</th>
						<th>Position</th>
					</tr>
				</thead>
				<tbody>
					<#list context.positions as position>
						<tr>
							<td></td>
							<td><#if position.organization??>
								<a href="/organizations/${position.organization.id}">${position.organization.name}</a>
							</#if></td>
							<td>
								<a href="/positions/${position.id}">${position.name}</a>
							</td>
						</tr>
					</#list>
				</tbody>
			</table>
		</div>
	 </div>
</section>

<section class="anet-block">
	<div class="anet-block__title">
		Reports by this Position
	</div>
	 <div class="anet-block__body">
		<div class="row">
			<table>
				<thead>
					<tr>
						<th>Date</th>
						<th>Who</th>
						<th>Topic</th>
					</tr>
				</thead>
				<tbody>
					<#list context.personReports as report>
						<tr>
							<td>${report.engagementDate}</td>
							<td>${report.primaryAttendee!}</td>
							<td><a href="/reports/${report.id}">${report.intent!"no summary"}</a></td>
						</tr>
					</#list>
				</tbody>
			</table>
		</div>
	 </div>
 </div>
</section>

<script type="text/javascript">
$(document).ready(function() {
	$.ajax({
		url: "/positions/empty?type=${role}",
		method: "GET"
	}).done(function(response) {
		var results = $.map(response, function(el) {
			return {
				id: el["id"],
				text: el["name"]
			}
		});
		$("#positionSelect").select2( {
			dropdownParent: $(".mainbody"),
			data: results,
			placeholder: "Select a position",
			allowClear: true
		});

	});

	$("#positionSetBtn").on('click', function(event) {
		var positionId = $("#positionSelect").val();
		$.ajax({ url: '/positions/' + positionId + '/person',
			method: "POST",
			contentType: 'application/json',
			data: JSON.stringify({ id: ${id} })
		}).done(function (response) {
			location.reload();
		})
	});
});
</script>

</@application.layout>
