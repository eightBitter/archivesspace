//= require dates.crud
//= require linker
//= require subrecord.too_many.js

$(function () {
  $.fn.init_related_agents_form = function () {
    $(this).each(function () {
      var $this = $(this);
      $('.linker', $this).linker();
      if ($this.hasClass('initialised') || $this.hasClass('too-many')) {
        return;
      }

      $this.addClass('initialised');

      $('ul.subrecord-form-list > li', $this).show();
      $('.linker', $this).triggerHandler('formshowall.aspace');

      var index = $('.subrecord-form-fields', $this).length;

      var changeRelatedAgentForm = function (event) {
        var $target_subrecord_list = $('.subrecord-form-list:first', $this);

        var template = 'template_' + $(this).val();

        var $subsubform = $(
          AS.renderTemplate(template, {
            path: AS.quickTemplate($target_subrecord_list.data('name-path'), {
              index: index,
            }),
            id_path: AS.quickTemplate($target_subrecord_list.data('id-path'), {
              index: index,
            }),
            index: '${index}',
          })
        );

        $(
          '.selected-container',
          $(this).closest('.subrecord-form-fields')
        ).html($subsubform);

        $(document).triggerHandler('subrecordcreated.aspace', [
          'related_agent',
          $subsubform,
        ]);
        $(document).triggerHandler('subrecordmonkeypatch.aspace', [
          $subsubform,
        ]);

        index++;
      };

      var initRemoveActionForSubRecord = function ($subform) {
        var removeBtn = $(
          "<a href='javascript:void(0)' class='btn btn-default btn-xs pull-right subrecord-form-remove' title='Remove sub-record' aria-label='Remove sub-record'><span class='glyphicon glyphicon-remove'></span></a>"
        );
        $subform.prepend(removeBtn);
        removeBtn.on('click', function () {
          AS.confirmSubFormDelete($(this), function () {
            if ($subform.parent().hasClass('subrecord-form-wrapper')) {
              $subform.parent().remove();
            } else {
              $subform.remove();
            }

            $this.parents('form:first').triggerHandler('formchanged.aspace');
            $(document).triggerHandler('subrecorddeleted.aspace', [$this]);
          });
        });
      };

      var addRelatedAgentSelector = function (event) {
        event.preventDefault();
        event.stopPropagation();

        var $target_subrecord_list = $('.subrecord-form-list:first', $this);
        var selected = $('option:selected', $(this).parents('.dropdown-menu'));
        var template = 'template_' + selected.val();

        var $subsubform = $(
          AS.renderTemplate('template_related_agents_selector', {
            path: AS.quickTemplate($target_subrecord_list.data('name-path'), {
              index: index,
            }),
            id_path: AS.quickTemplate($target_subrecord_list.data('id-path'), {
              index: index,
            }),
            index: '${index}',
          })
        );

        $subsubform = $('<li>')
          .data('type', $subsubform.data('type'))
          .append($subsubform);
        $subsubform.attr('data-index', index);
        $subsubform.show();
        $target_subrecord_list.append($subsubform);

        initRemoveActionForSubRecord($subsubform);

        $(document).triggerHandler('subrecordcreated.aspace', [
          'related_agent',
          $subsubform,
        ]);
        $(document).triggerHandler('subrecordmonkeypatch.aspace', [
          $subsubform,
        ]);

        $('select.related-agent-type', $subsubform).change(
          changeRelatedAgentForm
        );

        AS.initSubRecordSorting($target_subrecord_list);

        $(':input:visible:first', $subsubform).focus();

        index++;
      };

      $('.add-related-agent-for-type-btn', $this).click(
        addRelatedAgentSelector
      );

      var $list = $('#related-agents-container > .subrecord-form-list');

      var $subrecord_form_fields = $(
        '> .subrecord-form-wrapper > .subrecord-form-fields',
        $list
      );
      if ($subrecord_form_fields.length > 0) {
        $subrecord_form_fields.each(function () {
          initRemoveActionForSubRecord($(this));
        });
      }

      $existingAgents = $(
        '.subrecord-form-list:first > .subrecord-form-wrapper',
        $this
      );
      tooManyAgents = AS.initTooManySubRecords(
        $this,
        $existingAgents.length,
        function (callback) {
          AS.initSubRecordSorting($list);
          AS.initAddAsYouGoActions($this, $list);

          if (callback) {
            callback();
          }
        }
      );

      if (tooManyAgents === false) {
        $this.addClass('initialised');
        AS.initSubRecordSorting($list);
        AS.initAddAsYouGoActions($this, $list);
      }
    });
  };

  $(document).ready(function () {
    $(document).bind('loadedrecordform.aspace', function (event, $container) {
      $(
        'section.related-agents-form.subrecord-form:not(.initialised)',
        $container
      ).init_related_agents_form();
    });
  });
});
