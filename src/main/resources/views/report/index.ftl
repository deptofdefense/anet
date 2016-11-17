<#import "../application/layout.ftl" as application>
<@application.layout>

	<div class="anet-page-head">
		<h1 class="pull-left" style="margin-top:0px!important;">Reports & Approvals</h1>
		<div class="submit pull-right"><a href="/reports/new"><btn type="submit" value="Submit Report" class="btn btn-default pull-right">Submit Report</btn></a>
	</div>

	<section id="my-unapproved">
		<h3>Unapproved Reports you submitted</h3>
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
	<hr>

	<section id="to-approve">
		<h3>Reports to Approve</h3>
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
			      <tr>
			        <th scope="row">Gruuber ͐ Katz</th>
			        <td>Statement adopted by the Continental Congress declaring independence from the British Empire.</td>
			        <td>Yesterday</td>
			      </tr>
		      </tbody>
	      </table>
		</div>
	</section>
	<hr>

	<section id="people-approve">
		<h3>Personnel to Approve</h3>
		<div class="anet-block__body">
			<table class="usa-table-borderless">
			    <thead>
			      <tr class="header">


			        <th scope="col">Age</th>
			        <th scope="col">Person</th>
			        <th scope="col">Position</th>
			        <th scope="col">Report Referenced</th>

			      </tr>
			    </thead>
			    <tbody>
				  <tr>
			      	<td>2 days</td>
			        <th scope="row">Katx</th>
			        <td>MOD Deputy COS</td>
			        <td>Statement adopted by the Continental Congress declaring independence from the British Empire.</td>
			      </tr>
		      </tbody>
	      </table>
		</div>
	</section>


<#list list as report>
<section class="anet-block">
  <div class="anet-block__title">
    ${report.createdAt} - ${report.author.name} with Principal Name
    <div class="pull-right">
    	Approval Status
    </div>
  </div>

  <div class="anet-block__body">
    <div class="row">
      <div class="col-md-6">
       <div class="field">
       	<div class="header">Status:</div>
       	<div class="content">${report.state}</div>
	   </div>
	  </div>
      <div class="col-md-6">
        <div class="field">
        ${report.reportText}
        </div>
        <div class="field">
        <small>
        Created at: ${report.createdAt} <br>Updated at: ${report.updatedAt}
        </small>
        </div>
      </div>
 	</div>
 	<div class="row">
 	<a class="expand" href="#">Expand</a>
 	<a class="pull-right" href="/reports/${report.id}/">View</a>
 	</div>
    </div>
    <div class="expanded-area">
	  <div class="row">
	      <div class="col-md-12">
	      <#if context.currentUser.id == report.author.id>
	      	<#if report.state == "DRAFT" >
	      		<button class="reportSubmitBtn" data-id="${report.id}" >Submit this report.</button>
	     	<#else>
	     		<#if report.state == "PENDING_APPROVAL">
	      			Your report is in for review and here is the progress:
	      		<#else>
					Your report has been released, here is the approval steps:
				</#if>
	      		<table>
	      			<tr><td>stage</td><td>Status</td><td>Approvers</td></tr>
	   				<#list report.approvalStatus as action>
	    				<tr>
	      					<td>${action?index}</td>
	      					<td>
	      						<#if action.type??>
	      							${action.type} by ${action.person} on ${action.createdAt}
	      						</#if>
	      					</td>
	      					<td><a href="/groups/${action.step.approverGroup.id}">${action.step.approverGroup.name}</a></td>
	      				</tr>
	      			</#list>
	      		</table>
	      	</#if>
	      <#elseif report.state == "PENDING_APPROVAL" >
	      <#--  check if this user can approve this TODO: make this suck less.  -->
	      	<#list report.approvalStep.approverGroup.members as m>
	      		<#if m.id == context.currentUser.id>
	      			You can approve this report!
	      			<button data-id="${report.id}" class="reportApproveBtn" >Approve</button> -
	      			<button data-id="${report.id}" class="reportRejectBtn" >Reject</button>
	      		</#if>
	      	</#list>
	      </#if>
	      </div>
	  </div>
  </div>
</section>
</#list>

<script type="text/javascript">
$(document).ready(function() {
	$('.expand').on('click',function(e){
	var target = $(e.currentTarget).parents('.anet-block').find('.expanded-area')
	if(target.hasClass('show')) {
		target.removeClass('show')
	} else {
		target.addClass('show')
	}
	})

	$(".reportSubmitBtn").on("click", function(event) {
		var id = $(event.currentTarget).attr("data-id");
		$.ajax({
			url: "/reports/" + id + "/submit",
			method: "GET"
		}).done(function(response) {
			location.reload();
		});
	});

	$(".reportApproveBtn").on("click", function(event) {
		var id = $(event.currentTarget).attr("data-id");
		$.ajax({
			url: "/reports/" + id + "/approve",
			method: "GET"
		}).done(function(response) {
			location.reload();
		});
	});
	$(".reportRejectBtn").on("click", function(event) {
		var id = $(event.currentTarget).attr("data-id");
		$.ajax({
			url: "/reports/" + id + "/reject",
			method: "GET"
		}).done(function(response) {
			location.reload();
		});
	});
})
</script>

</@application.layout>
