import * as httpUtil from '../utils/http';
import * as modalUtil from '../utils/modals';
import * as RecordUtil from '../utils/record';
import {marcJsonToHtml} from '../utils/edit';

export function initToolbar(_context) {
  const context = _context;
  // TOOLBAR-REMOVE
  $('.js-toolbar-remove').click(function(e) {
    e.preventDefault();
    let url = $(this).attr('data-record-id');
    if (url[0] !== '/') {
      url = `/${url}`;
    }
    modalUtil.confirmDialog({
      sTitle: 'Ta bort?',
      sContent: 'Du kan inte ångra detta val.',
      sAccept: 'OK',
      sReject: 'Avbryt',
      sType: 'danger' }).then(() => {
        // accepted by user
        httpUtil._delete({ url, token: context.access_token }).then((result) => {
          console.log("post WAS deleted...", result);

          // Force reload
          window.location.reload();
        }, (result) => {
          console.log("post was NOT deleted...", result);
        });
      }, () => {
      // rejected by user
    });
  });

  $('.js-toolbar-marc').click(function(e) {
    e.preventDefault();
    function showModal(result) {
      let content = '';
      // !TODO add general error message display for all xhr-requests
      if (result.name === 'Error') {
        content = `Failed to convert to MARC: ${result}`;
      } else {
        content = `<section class="marc-code">
                    ${marcJsonToHtml(result)}
                  </section>`;
      }
      modalUtil.modal({
        sTitle: 'MARC förhandsgranskning',
        sContent: content,
      }).then(() => {}, () => {});
    }
    context.vm.convertItemToMarc().then(showModal, showModal);
  });

  // Copy button
  const itemUrl = $('#itemId').text();
  RecordUtil.getNewCopy(itemUrl).then((response) => {
    $('#copyItem').text(JSON.stringify(response));
    $('.js-toolbar-copy').removeClass('hidden');
  }, (error) => {
    console.warn("Couldn't prepare item copy, hiding copy button.", error);
  });
}
