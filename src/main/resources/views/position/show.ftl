<#import "../application/layout.ftl" as application>
<@application.layout>
<#if type == 'ADVISOR'>
	<#assign otherPositionName = 'Tashkil'>
	<#assign otherPositionType = 'PRINCIPAL' >
	<#assign positionName = 'Billet'>
<#else>
	<#assign otherPositionName = 'Billet'>
	<#assign otherPositionType = 'ADVISOR' >
	<#assign positionName = 'Tashkil'>
</#if>

<#if context.orgHierarchy?? >
	<#list context.orgHierarchy as org>
		<a href="/organizations/${org.id}">${org.name}</a> &gt;
	</#list>
	${positionName}s
<#else>
	Not assigned to any Organization!
</#if>

<div class="submit pull-right">
	<div class="pull-right"><a href="/positions/${id}/edit"><btn type="submit" value="Modify ${positionName}" class="btn btn-default pull-right">Modify ${positionName}</btn></a></div>
</div>
<h3 class="pull-left" style="margin-top:0px!important;">${name} - ${code!}</h3>
<br><Br><Br><Br> <!-- TODO: fix this! -->

<section class="anet-block">
	<div class="anet-block__title"></div>
	<div class="anet-block__body">
		<div class="row">
			<div class="col-md-6">
				<div class="field">
					<div class="header">Position Number</div>
		       		<div class="content">${code!}</div>
				</div>
				<div class="field">
					<div class="header">Position Type</div>
		       		<div class="content">${type}</div>
				</div>
				<div class="field">
					<div class="header">Organization</div>
		       		<div class="content">
		       			<#if organization??><a href="/organizations/${organization.id}">${organization.name}</a></#if>
		       		</div>
				</div>
				<div class="field">
					<div class="header">Location</div>
		       		<div class="content"></a></div>
				</div>
			</div>
			<div class="col-md-6">
				Description:
			</div>
		</div> 
	</div>
</section>

<#if person??>
<section class="anet-block">
	<div class="anet-block__title">
		<a href="/people/${person.id}">${person.name}</a>
	</div>
	<div class="anet-block__body">
		<div class="row">
			<div class="col-md-6">
				<div class="field">
					<div class="header">Phone</div>
		       		<div class="content">${person.phoneNumber!}</div>
				</div>
				<div class="field">
		       		<div class="header">Email</div>
		       		<div class="content"><a href="mailto:${person.emailAddress!}">${person.emailAddress!}</a></div>
				</div>
			</div>
			<div class="col-md-6">
				<div class="field">
					<div class="header">Role:</div>
					<div class="content">${person.role!}</div>
				</div>
				<div class="field">
		       		<div class="header">Rank</div>
		       		<div class="content">${person.rank!}</div>
				</div>
			</div>
		</div>
	</div>
</section>
</#if>

<h3>${otherPositionName}s</h3>
<table>
	<tr>
		<th>Name</th>
		<th>Position</th>
		<th>Last Report</th>
		<th>Date of Last Report</th>
	</tr>
	<#list context.relatedPositions as related>
		<tr>
			<td><#if related.person??>${related.person.name}</#if></td>
			<td>${related.name} (${related.code!})</td>
			<td>last report intent here</td>
			<td>last report date here</td>
		</tr>
	</#list>
</table>

<h3>Previous Position Holders</h3>
<table>
	<tr>
		<th>Person</th>
		<th>Date</th>
	</tr>
	<#list context.previousHolders as person>
		<tr>
			<td>${person.name}</td>
			<td>Date person rotated out</td>
		</tr>
	</#list>
</table>

<h3>Reports by this Position</h3>
<table>
	<tr>
		<th>Who</th>
		<th>Topic</th>
	</tr>
	<#list context.positionReports as report>
		<tr>
			<td>${report.primaryAttendee!}</td>
			<td><a href="/reports/${report.id}">${report.intent!"no summary"}</a></td>
		</tr>
	</#list>
</table>

<script type="text/javascript">
$(document).ready(function() { 
	$("#newPositionSelect").select2({
		dropdownParent: $(".mainbody"),
		placeholder: "search by code",
		ajax: {
			url: "/positions/byCode",
			dataType: 'json',
			delay: 250,
			method: 'GET',
			data: function(params) {
				return { 
					code : params.term, 
					prefixMatch: true, 
					type: "${otherPositionType}"
				}
			},
			processResults :  function(data, params) {
				var results =_.map(data, function (el) {
					return {
						id: el["id"] ,
						text: el["name"] + " (" + el["code"] + ")"
					}
				});
				return { results: results };
			}
		},
		minimumInputLength : 2
	});

	$("#newPositionBtn").on('click', function() { 
		var positionId = $("#newPositionSelect").val();
		$.ajax({ url : "/positions/${id}/associated",
			contentType: 'application/json',
			method: 'POST',
			data : JSON.stringify( { "id" : positionId})
		}).done(function(response) { 
			location.reload();
		});
	});

});

</script>
</@application.layout>
