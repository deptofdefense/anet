<#-- @ftlvariable name="" type="mil.dds.anet.beans.Report" -->
<#include "../template/header.ftl">
            <div class="row">
              <div class="anet-top-block">
                <div class="user-submit">Submitting as ${context.currentUser.name}</div>
                <div class="submit"><input type="submit" value="Submit" class="btn btn-default pull-right"></div>
              </div>
            </div>
            <div class="row">
              <form id="reportForm" >
                <section class="anet-block">
                  <div class="anet-block__title">
                    Report Details
                  </div>

                  <div class="anet-block__body">
                    <div class="form-group">
                      <label for="engagementIntent">Intent of Engagement</label>
                      <textarea id="engagementIntent" name="intent" ></textarea>
                    </div>

                    <div class="row">
                      <div class="col-md-6">
                        <div class="form-group">
                          <label for="afghanPrincipal">Afghan Principal Name (or TASHKIL)</label>
                          <select id="afghanPrincipal" name="principal_id" ></select>
                        </div>

                        <div class="form-group">
                          <label for="engagementDate">Engagement Date</label>
                          <input id="engagementDate" type="date">
                        </div>
                      </div>

                      <div class="col-md-6">
                        <div class="form-group">
                          <label for="engagementLocation">Engagement Location</label>
                          <select id="engagementLocation" name="location_id" ></select>
                        </div>

                        <div class="form-group">
                          <label for="affectedOrgs">Affected Advising Orgs</label>
                          <select id="affectedOrgs"></select>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section class="anet-block">
                  <div class="anet-block__title">
                    Discussion
                  </div>

                  <div class="anet-block__body">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="form-group">
                          <label for="engagementAtmosphere">Atmosphere of Engagement</label>
                          <select id="engagementAtmosphere" >
                            <option>Positive</option>
                            <option>Neutral</option>
                            <option>Negative</option>
                          </select>
                        </div>
                      </div>

                      <div class="col-md-6">
                        <div class="form-group">
                          <label for="engagementAtmosphereDetails">Atmospheric Details</label>
                          <input id="engagementAtmosphereDetails">
                        </div>
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="engagementDetails">Describe the discussion in detail</label>
                      <textarea id="engagementDetails" name="reportText" ></textarea>
                    </div>

                    <div class="form-group">
                      <label for="engagementNextSteps">Recommended next steps?</label>
                      <textarea id="engagementNextSteps" name="nextSteps" ></textarea>
                    </div>
                  </div>
                </section>

                <section class="anet-block">
                  <div class="anet-block__title">
                    Other Stakeholders
                  </div>

                  <div class="anet-block__body">
                    <div class="row">
                      <div class="col-md-6">
                        <form class="anet-attach-person">
                          <div class="form-group">
                            <label for="attachPersonName">Name of Individual</label>
                            <select id="attachPersonName"></select>
                          </div>

                          <div class="form-group hide" data-attach-person-type>
                            <input type="radio" value="advisor" name="attachPersonType" id="attachPersonTypeAdvisor">
                            <label for="attachPersonTypeAdvisor">Advisor</label>
                            <input type="radio" value="principal" name="attachPersonType" id="attachPersonTypePrincipal">
                            <label for="attachPersonTypePrincipal">Afghan Principal</label>
                            <input type="radio" value="other" name="attachPersonType" id="attachPersonTypeOther">
                            <label for="attachPersonTypeOther">Other</label>
                          </div>

                          <div class="form-group hide" data-attach-person-group>
                            <label for="attachPersonGroup">Organizational Group</label>
                            <select id="attachPersonGroup"></select>
                          </div>

                          <div class="form-group">
                            <button type="button" class="btn btn-default pull-right hide" data-attach-person-submit>Add Person</button>
                          </div>
                        </form>
                      </div>

                      <div class="col-md-6">
                        <table>
                          <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Org</th>
                          </tr>
                          <tr data-attached-person-prototype>
                            <td data-name></td>
                            <td data-role></td>
                            <td data-org></td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </div>
                </section>

                <section class="anet-block">
                  <div class="anet-block__title">
                    Essential Functions and Milestones
                  </div>

                  <div class="anet-block__body">
                    <div class="row">
                      <div class="col-md-6">
                        <form class="anet-attach-ef">
                          <div class="form-group">
                            <label for="attachEFName">Essential Function</label>
                            <select id="attachEFName">
                            	<option></option>
							<#list context.efs as ef>
								<option value="${ef.id}">${ef.shortName} - ${ef.longName}</option>
							</#list>
							</select>
                          </div>

                          <div class="form-group">
                            <label for="attachEFMilestones">Milestones</label>
                            <select id="attachEFMilestones" >
                            </select>
                          </div>

                          <div class="form-group">
                            <label for="attachEFActions">Actions</label>
                            <select id="attachEFActions" multiple="multiple">
                            </select>
                          </div>

                          <div class="form-group">
                            <input type="submit" value="Add EF" class="btn btn-default pull-right">
                          </div>
                        </form>
                      </div>

                      <div class="col-md-6">
                        <table>
                          <tr>
                            <th>Essential Function</th>
                            <th>POAM</th>
                            <th>Level</th>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </div>
                </section>

                <section class="anet-block">
                  <div class="anet-block__title">
                    Summary
                  </div>

                  <div class="anet-block__body">
                    <div class="form-group">
                      <label for="engagementSummary">Executive Summary</label>
                      <textarea id="engagementSummary"></textarea>
                    </div>
                  </div>
                </section>

              </form>
              <input type="submit" value="Submit" class="btn btn-default pull-right" id="reportSubmit" >
            </div>
          </div>
        </div>
      </div>
<#include "../template/footer.ftl">

<script type="text/javascript">
$(document).ready(function () {
	enablePersonSearch("#afghanPrincipal","PRINCIPAL");
	enablePersonSearch("#attachPersonName","ADVISOR");
	enableLocationSearch("#engagementLocation");

	$("#attachEFName").select2({
		dropdownParent: $(".mainbody"),
		placeholder: 'Select an EF'
	});
	$("#attachEFName").on("select2:select", function (e) {
		var efId = $("#attachEFName").val();
		$.ajax( {
			url: '/poams/' + efId + '/children?cat=Milestone',
			method: "GET"
		}).done(function(response) {
			var results = _.map(response, function(el) {
				return {
					id : el.id,
					text: el.shortName + " - " + el.longName
				}
			});
			$("#attachEFMilestones").empty();
			$("#attachEFMilestones").select2({
				data: results,
				dropdownParent: $(".mainbody")
			});
		});
	});

	$("#attachEFMilestones").on("select2:select", function(e) {
		var milestoneId = $("#attachEFMilestones").val();
		$.ajax({
			url: '/poams/' + milestoneId + '/children?cat=Action',
			method: 'GET'
		}).done(function(response) {
		var results = _.map(response, function(el) {
				return {
					id : el.id,
					text: el.shortName + " - " + el.longName
				}
			});
			$("#attachEFActions").empty();
			$("#attachEFActions").select2({
				data: results,
				dropdownParent: $(".mainbody")
			});
		});
	});

	$("#reportSubmit").on("click", function(event) {
		var report = buildForm("reportForm");
		if (report["principal_id"]) {
			report["principals"] = [{ id: report["principal_id"] }]
			delete report["principal_id"];
		}
		if (report["location_id"]) {
			report["location"] = { id: report["location_id"] }
			delete report["location_id"];
		}

		$.ajax({
			url : '/reports/new',
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify(report)
		}).done( function (response) {
			window.location = "/reports/" + response.id;
		});
	});
});

var $personRow = $('[data-attached-person-prototype]').removeAttr('data-attached-person-prototype');
var $personTable = $personRow.parent();
$personRow.remove();

var $attachPersonType = $('[data-attach-person-type]');
var $attachPersonGroup = $('[data-attach-person-group]');
var $attachPersonSubmit = $('[data-attach-person-submit]');
var addingPerson = {};

function addPersonToTable(person) {
  var $row = $personRow.clone();
  $row.find('[data-name]').html(person.name);
  $row.find('[data-role]').html(person.role);
  $row.find('[data-org]').html(person.org);
  $row.appendTo($personTable);
}

function enablePersonSearch(selectId, role) {
	$(selectId).select2({
    dropdownParent: $(".mainbody"),
		ajax: {
			url: "/people/search",
			dataType: 'json',
			delay: 250,
			method: 'GET',
			data: function(params) {
				return {q: params.term, role: role}
			},
			processResults: function(data, params) {
				var names = [];
        if (role !== 'PRINCIPAL') {
          names.push({id:'-1', text: "Create new person named " + params.term, query: params.term});
        }
				for (i in data) {
          var person = data[i];
          person.name = person.firstName + " " + person.lastName;
					names.push({
						id: person.id,
						text: person.name + " " + person.rank + " - " + person.role,
            person: person
					});
				}
				return {results: names};
			}
		},
		minimumInputLength: 2
	}).on('select2:close', function(data) {
    var $this = $(this);
    var result = $this.select2('data')[0];
    if (result.person) {
      var person = result.person;
      addPersonToTable(person);
      $('#attachPersonName').val('').trigger('change');
    } else if (result.query) {
      addingPerson = {name: result.query};
      $attachPersonType.removeClass('hide');
      $attachPersonGroup.removeClass('hide');
      $attachPersonSubmit.removeClass('hide');
    }
  });
};

$attachPersonSubmit.on('click', function() {
  var $checkedRole = $attachPersonType.find(':checked');
  addingPerson.role = $checkedRole.val().toUpperCase();
  addPersonToTable(addingPerson);
  $checkedRole.val('');
  $attachPersonType.addClass('hide');
  $attachPersonGroup.addClass('hide');
  $attachPersonSubmit.addClass('hide');
  $('#attachPersonName').val('').trigger('change');
  return false;
})

function enableLocationSearch(selectId) {
	$(selectId).select2({
    dropdownParent: $(".mainbody"),
		ajax: {
			url: "/locations/search",
			dataType: 'json',
			delay: 250,
			method: 'GET',
			data: function(params) {
				return { q : params.term }
			},
			processResults :  function(data, params) {
				var results =_.map(data, function (el) {
					return {
						id: el["id"] ,
						text: el["name"]
					}
				});
				return { results: results };
			}
		},
		minimumInputLength : 2
	});
};

</script>
