/* --- CENTRALIZED DRAG & DROP MANAGER --- */

function setupDragAndDrop(canvasEl, sidebarEl) {
    if(typeof Sortable === 'undefined') {
        console.warn('SortableJS not loaded.');
        return;
    }

    // 1. Sidebar (Source)
    // Removed duplicative init from components-sidebar.js
    new Sortable(sidebarEl, {
        group: { name: 'builder', pull: 'clone', put: false },
        sort: false,
        animation: 150,
        draggable: '.zt-module-btn'
    });

    // 2. Main Canvas (Destination)
    new Sortable(canvasEl, {
        group: 'builder',
        animation: 150,
        draggable: '.zt-builder-block',
        ghostClass: 'sortable-ghost',
        // KEY: Filter out editable content so user can select text without dragging block
        filter: '.zt-block-content',
        preventOnFilter: false,
        onUpdate: function() { window.ztEditorIsDirty = true; captureEditorState(); },
        onAdd: function (evt) {
            window.ztEditorIsDirty = true;
            const item = evt.item;
            const type = item.getAttribute('data-type');
            const newBlock = createBlockHTML(type);

            if(newBlock) {
                item.parentNode.replaceChild(newBlock, item);
                if (type === 'grid') refreshNestedSortables(newBlock);
                selectBlock(newBlock);
                captureEditorState();
            } else {
                item.remove();
            }
        }
    });
}

// Renamed from initNestedSortables to prevent confusion
function refreshNestedSortables(rootEl) {
    if(typeof Sortable === 'undefined') return;

    const cols = rootEl.querySelectorAll('.zt-column');
    cols.forEach(col => {
         // Avoid double binding
         if(col.getAttribute('data-sortable-init')) return;

         new Sortable(col, {
            group: 'builder',
            sort: true,
            draggable: '.zt-builder-block',
            ghostClass: 'sortable-ghost',
            filter: '.zt-block-content',
            preventOnFilter: false,
            emptyInsertThreshold: 20, // Increases hit area for empty columns
            invertSwap: true, // Improves swapping behavior
            onUpdate: function() { window.ztEditorIsDirty = true; captureEditorState(); },
            onAdd: function (evt) {
                window.ztEditorIsDirty = true;
                const item = evt.item;
                if(item.classList.contains('zt-module-btn')) {
                     const type = item.getAttribute('data-type');
                     const newBlock = createBlockHTML(type);
                     if(newBlock) {
                         item.parentNode.replaceChild(newBlock, item);
                         selectBlock(newBlock);
                         captureEditorState();
                     } else { item.remove(); }
                }
            }
         });
         col.setAttribute('data-sortable-init', 'true');
    });
}
