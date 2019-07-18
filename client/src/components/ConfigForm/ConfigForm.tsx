import * as React from 'react';
import axios from 'axios';

import { IGameConfig } from '../../../../shared/types';
import { Button } from '../UI';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const defaultFormData: IGameConfig = {
  name: '',
  password: '',
  maxPlayers: 4,
  difficulty: null,
  category: null,
  numOfQuestions: 10,
};

const difficulties = ['easy', 'medium', 'hard'];
const numOfQuestions = [5, 10, 15, 20];

const ConfigForm = ({ closeModal, onSubmitHandler }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [formData, updateFormData] = React.useState(defaultFormData);
  const [categories, setCategory] = React.useState([]);

  React.useEffect(() => {
    const getCategories = async () => {
      try {
        const opentDbResponse = await axios.get(
          'https://opentdb.com/api_category.php'
        );
        const {
          data: { trivia_categories },
        } = opentDbResponse;

        setLoaded(true);
        setCategory(trivia_categories);
      } catch (error) {}
    };

    getCategories();
  }, []);
  const onInputChange = e => {
    const { name, value } = e.target;

    updateFormData({
      ...formData,
      [name]: value,
    });
  };

  const onSubmit = e => {
    e.preventDefault();

    closeModal();
    onSubmitHandler(formData);
  };

  if (!loaded) {
    return <div>loading data...</div>;
  }

  return (
    <form onSubmit={onSubmit}>
      <fieldset>
        <label htmlFor="name">
          Game Name:{' '}
          <input id="name" type="text" name="name" onChange={onInputChange} />
        </label>
      </fieldset>
      <fieldset>
        <label htmlFor="password">
          Password:{' '}
          <input
            id="password"
            type="password"
            name="password"
            onChange={onInputChange}
          />
        </label>
      </fieldset>
      <fieldset>
        <label htmlFor="difficulty">Difficulty:</label>
        <select id="difficulty" name="difficulty" onChange={onInputChange}>
          <option value={null}>Any</option>
          {difficulties.map((difficulty, indice) => (
            <option key={indice} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
      </fieldset>
      <fieldset>
        <label htmlFor="category">Category:</label>
        <select id="category" name="category" onChange={onInputChange}>
          <option value={null}>Any</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </fieldset>
      <fieldset>
        <label htmlFor="maxPlayers">
          Max Players:{' '}
          <input
            id="maxPlayers"
            type="number"
            name="maxPlayers"
            onChange={onInputChange}
          />
        </label>
      </fieldset>
      <fieldset>
        <label htmlFor="numOfQuestions">Number of Questions:</label>
        <select
          id="numOfQuestions"
          name="numOfQuestions"
          onChange={onInputChange}
        >
          {numOfQuestions.map(n => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </fieldset>
      <Button.Group>
        <div style={{ display: 'flex', width: '100%' }}>
          <Button
            onClick={() => {
              closeModal();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="green"
            style={{
              flexGrow: 1,
            }}
          >
            <FontAwesomeIcon icon={faCheck} /> Create
          </Button>
        </div>
      </Button.Group>
    </form>
  );
};

export { ConfigForm };
