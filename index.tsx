import React, { Component } from 'react';
import { render } from 'react-dom';
import DragDropItems from './DragDropItems.js';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import './style.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'React',
    };
  }

  render() {
    const arr = [
      { id: 1, name: 'AWARENESS', keyMessage: '', translation: '' },
      { id: 2, name: 'CONVICTION', keyMessage: '', translation: '' },
      { id: 3, name: 'DESIRE', keyMessage: '', translation: '' },
      { id: 4, name: 'COMPREHENSION', keyMessage: '', translation: '' },
      { id: 5, name: 'ADOPTION', keyMessage: '', translation: '' },
      // { id: 6, name: 'ADVOCACY', keyMessage: '', translation: '' },
    ];

    return (
      <div>
        <DndProvider backend={HTML5Backend}>
          <DragDropItems title="New Stages" data={arr} />
        </DndProvider>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
