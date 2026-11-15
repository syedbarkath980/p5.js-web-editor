import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import * as ProjectActions from './projects';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader } from '../reducers/loading';
import {
  initialTestState,
  mockProjects
} from '../../../testData/testReduxStore';

const mockStore = configureStore([thunk]);
let lastSearchParams;

const server = setupServer(
  rest.get(`/${initialTestState.user.username}/projects`, (req, res, ctx) => {
    lastSearchParams = req.url.searchParams;
    return res(ctx.json(mockProjects));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('projects action creator tests', () => {
  let store;

  afterEach(() => {
    store.clearActions();
  });

  it('creates GET_PROJECTS after successfuly fetching projects', () => {
    store = mockStore(initialTestState);

    const expectedActions = [
      { type: startLoader.type },
      { type: ActionTypes.SET_PROJECTS, projects: mockProjects },
      { type: stopLoader.type }
    ];

    return store
      .dispatch(ProjectActions.getProjects('happydog'))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
  });

  it('includes a p5 version filter when provided', () => {
    store = mockStore(initialTestState);

    return store
      .dispatch(
        ProjectActions.getProjects('happydog', {
          p5Version: '1.11.13'
        })
      )
      .then(() => {
        expect(lastSearchParams.get('p5Version')).toBe('1.11.13');
      });
  });
});
