(function ($, Sonata) {

    var reduce = Array.prototype.reduce;

    var triggerEvent = Sonata.Admin.triggerEvent;
    var triggerEventAsync = Sonata.Admin.triggerEventAsync;

    /**
     * @constant
     * @type {RegExp}
     */
    var HIGHEST_COUNTER_REGEXP = /_(\d+)\D*$/;

    /**
     * @constant
     * @type {{(string): Number}}
     */
    var COLLECTION_COUNTERS = {};

    /**
     *
     * @param {jQuery} $trigger
     *
     * @fires sonata:native-collection-item-add
     * @fires sonata:native-collection-item-added
     */
    function addCollectionRow ($trigger) {
        var $container = $trigger.closest('[data-prototype]');
        var id = $container.attr('id');
        var counter = COLLECTION_COUNTERS[id] + 1;

        var prototype = $container.data('prototype');
        var prototypeName = $container.data('prototypeName') || '__name__';

        // Set field id
        var idRegexp = new RegExp(id + '_' + prototypeName, 'g');
        prototype = prototype.replace(idRegexp, id + '_' + counter);

        // Set field name
        var fieldName = id.split('_').slice(-1)[0];
        var nameRegexp = new RegExp(fieldName + '\\]\\[' + prototypeName, 'g');
        prototype = prototype.replace(nameRegexp, fieldName + '][' + counter);

        var $newRow = $(prototype);
        //TODO: who should trigger this event ? form or field ?
        return triggerEvent('sonata:native-collection-item-add', $trigger.parent(), {
            item: $newRow,
            prototype: $container
        }).then(function (event) {
            COLLECTION_COUNTERS[id] = counter;
            $newRow.insertBefore($trigger.parent());
            $newRow.trigger('sonata:domready');
            triggerEventAsync('sonata:native-collection-item-added', $newRow);
        });
    }

    /**
     *
     * @param {jQuery} $trigger
     *
     * @fires sonata:native-collection-item-delete
     * @fires sonata:native-collection-item-deleted
     */
    function removeCollectionRow ($trigger) {
        var $row = $trigger.closest('.sonata-collection-row');
        return triggerEvent('sonata:native-collection-item-delete', $row).then(function (event) {
            var $parent = $row.parent(); //TODO: who should be this event's target ?
            $row.remove();
            $parent.trigger('sonata:native-collection-item-deleted');
        });
    }

    /**
     * Initializes the counters for the collection forms.
     *
     * @param {jQuery} $subject
     */
    function setupCollectionCounters ($subject) {
        // Count and save element of each collection
        $subject.find('[data-prototype]').each(function() {
            var $collection = $(this);
            var counter = reduce.call($collection.children(), function (counter, item) {
                var $fieldContainer = $(item).find('[id^="sonata-ba-field-container"]');
                var matches = HIGHEST_COUNTER_REGEXP.exec($fieldContainer.attr('id'));
                if (matches && matches[1] && matches[1] > counter) {
                    counter = parseInt(matches[1], 10);
                }

                return counter;
            }, 0);
            COLLECTION_COUNTERS[$collection.attr('id')] = counter;
        });
    }

    $(function () {
        setupCollectionCounters($(document));
    });
    $(document)
        .on('sonata:domready', function (event) {
            setupCollectionCounters($(event.target));
        })
        .on('click.sonata-admin', '.sonata-collection-add', function (event) {
            event.preventDefault();
            addCollectionRow($(event.target));
        })
        .on('click.sonata-admin', '.sonata-collection-delete', function (event) {
            event.preventDefault();
            removeCollectionRow($(event.target));
        })
    ;

}(jQuery, Sonata));