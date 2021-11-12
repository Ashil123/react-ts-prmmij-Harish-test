import React, { useState, useRef, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from 'react-bootstrap';
import update from 'immutability-helper';
import { BsPlusCircle } from 'react-icons/bs';
import 'bootstrap/dist/css/bootstrap.min.css';

const DragDropItems = (props) => {
  const [actualItem, setActualItem] = useState(props.data);
  const [dropItem, setDropItem] = useState([]);
  const [itemInput, setItemInput] = useState('');
  const [isDropable, setIsDropable] = useState(false);
  const toast = useRef(null);

  const leftstyle = {
    width: '20rem',
    height: '20rem',
    overflow: 'auto',
    textAlign: 'center',
  };

  const rightstyle = {
    minWidth: '20rem',
    height: '20rem',
    overflow: 'auto',
    textAlign: 'center',
    width: 'auto',
    marginTop: '46px',
  };
  const [{ isOver }, addToItemRef] = useDrop({
    accept: 'actual',
    collect: (monitor) => {
      return {
        isOver: !!monitor.isOver(),
      };
    },
  });

  const [{ isOver: isPlayerOver }, removeFromItemRef] = useDrop({
    accept: 'dropdata',
    collect: (monitor) => {
      return {
        isOver: !!monitor.isOver(),
      };
    },
  });

  const moveRecord = (item, isDrag = '') => {
    // console.log('move record - left and right', item, isDrag);
    // if (isDrag) return null
    if (item && item.type === 'actual') {
      console.log('IFF', isDropable);
      setDropItem((_item) => [..._item, actualItem[item.index]]);
      setActualItem((_actual) =>
        _actual.filter((_, idx) => idx !== item.index)
      );
    } else {
      console.log('ELSE', isDropable);
      if (isDropable) {
        setActualItem((_actual) => [..._actual, dropItem[item.index]]);
        setDropItem((_item) => _item.filter((_, idx) => idx !== item.index));
        // setIsDropable(false);
      }
    }
  };
  const dragHoverTeamBG = isOver ? 'bg-warning' : 'bg-light';
  const dragHoverPlayerBG = isPlayerOver ? 'bg-warning' : 'bg-light';

  const addNewItem = (itemText) => {
    let copyText = itemText.replace(/ /g, '').toLowerCase();
    let isAdded = true,
      result;

    if (copyText) {
      // check item exist on list
      if (actualItem && Array.isArray(actualItem)) {
        let arr = [...dropItem, ...actualItem];
        result = arr.find((e) =>
          (e.name && e.name.toLowerCase()) === copyText ? true : false
        );
        if (result) {
          isAdded = false;
        }
      }

      if (isAdded) {
        // process to add new item
        actualItem.push({
          id: actualItem.length + 1,
          name: itemText,
          keyMessage: '',
          translation: '',
        });
        setActualItem([...actualItem]);
        setItemInput('');
      } else {
        // show alert message
        setItemInput('');
        toast.current.show({
          severity: 'error',
          summary: null,
          detail: 'You have already added in the list',
        });
      }
    }
  };

  const moveCard = useCallback(
    (dragIndex, hoverIndex, idx) => {
      // console.log('move card.  -- up and down', dragIndex, hoverIndex, idx);
      const dragCard = dropItem[dragIndex];
      setDropItem(
        update(dropItem, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCard],
          ],
        })
      );
    },
    [dropItem]
  );

  const onDragEnter = (event) => {
    console.log('onDragEnter', isDropable, event.target.value);
    setIsDropable(true);
  };

  const onDragLeave = (event) => {
    console.log('onDragleave'); // isDropable
    // setIsDropable(false);
  };

  return (
    <>
      <div className="d-flex justify-content-md-center">
        <div>
          <input
            className="py-1 px-2 mx-2 rounded border"
            style={{ width: '15.5rem' }}
            type="text"
            value={itemInput}
            onChange={(e) => setItemInput(e.target.value)}
            placeHolder={props.title}
          />

          <Button
            className="btn btn-primary btn-md rounded-pill"
            onClick={() => addNewItem(itemInput)}
          >
            {' '}
            <BsPlusCircle className="d-inline-block mr-2" />
            new{' '}
          </Button>
          <div
            className={`border m-2`}
            style={{ ...leftstyle }}
            id="leftSide"
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
          >
            <ul className="list-group py-2 h-100" ref={removeFromItemRef}>
              {actualItem.map((item, idx) => (
                <ItemsList
                  record={item}
                  key={idx}
                  index={idx}
                  recordType="actual"
                  moveCard={null}
                  onDropRecord={moveRecord}
                />
              ))}
            </ul>
          </div>
        </div>
        <div className={`border`} style={{ ...rightstyle }} id="rightSide">
          <ul className="list-group py-2 h-100" ref={addToItemRef}>
            {dropItem.map((item, idx) => (
              <ItemsList
                record={item}
                key={idx}
                index={idx}
                recordType="dropdata"
                moveCard={moveCard}
                isSortable={true}
                onDropRecord={moveRecord}
              />
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

const ItemsList = ({
  record,
  index,
  recordType,
  moveCard,
  onDropRecord,
  isSortable,
}) => {
  const ref = useRef(null);

  const [{ isDragging }, dragRef] = useDrag({
    type: recordType,
    item: {
      type: recordType,
      index,
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onDropRecord(item);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ handlerId }, drop] = useDrop({
    accept: recordType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      monitor.isOver({ shallow: true });
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      if (isSortable) {
        moveCard(dragIndex, hoverIndex);
      }
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });
  if (isSortable) {
    dragRef(drop(ref));
  }
  return (
    <li className="my-1">
      <div className="card border-0">
        <div
          style={{ display: 'flex', justifyContent: 'center' }}
          className="my-1"
        >
          <div ref={ref}>
            <div
              className="mx-1 py-2 rounded"
              style={{ width: '15rem', backgroundColor: '#dee2e6' }}
              ref={dragRef}
            >
              {record.name}
            </div>
          </div>
          {recordType === 'dropdata' && (
            <>
              <input
                className="px-2 mx-1 rounded border"
                type="text"
                name="Add Translator"
                placeholder="Add Translator"
                onChange={(e) => {
                  record.keyMessage = [e.target.value];
                }}
              />
              <input
                className="px-2 mx-1 rounded border"
                type="text"
                name="tagTranslator"
                placeholder="Key Message"
                onChange={(e) => {
                  record.translation = [e.target.value];
                }}
              />
            </>
          )}
        </div>
      </div>
    </li>
  );
};
export default DragDropItems;
