jest.mock('@actions/core');
jest.mock('@actions/github');

const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');
const run = require('../src/create-release.js');

/* eslint-disable no-undef */
describe('Create Release', () => {
  let createRelease;
  let listReleases;

  beforeEach(() => {
    createRelease = jest.fn().mockReturnValueOnce({
      data: {
        id: 'releaseId',
        html_url: 'htmlUrl',
        upload_url: 'uploadUrl'
      }
    });
    listReleases = jest.fn().mockReturnValueOnce({
      data: [
        {
          id: 'releaseId',
          html_url: 'htmlUrl',
          upload_url: 'uploadUrl'
        }
      ]
    });

    context.repo = {
      owner: 'owner',
      repo: 'repo'
    };

    const github = {
      repos: {
        createRelease,
        listReleases
      }
    };

    GitHub.mockImplementation(() => github);
  });

  test('Create release endpoint is called', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('refs/tags/v1.0.0')
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false');

    await run();

    expect(createRelease).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      tag_name: 'v1.0.0',
      name: 'myRelease',
      body: 'myBody',
      draft: false,
      prerelease: false
    });
  });

  test('List release endpoint is called', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('refs/tags/v1.0.0')
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false');

    await run();

    expect(listReleases).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo'
    });
  });

  test('Draft release is created', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('refs/tags/v1.0.0')
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('true')
      .mockReturnValueOnce('false');

    await run();

    expect(createRelease).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      tag_name: 'v1.0.0',
      name: 'myRelease',
      body: 'myBody',
      draft: true,
      prerelease: false
    });
  });

  test('Pre-release release is created', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('refs/tags/v1.0.0')
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('true');

    await run();

    expect(createRelease).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      tag_name: 'v1.0.0',
      name: 'myRelease',
      body: 'myBody',
      draft: false,
      prerelease: true
    });
  });

  test('Release with empty body is created', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('refs/tags/v1.0.0')
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('') // <-- The default value for body in action.yml
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false');

    await run();

    expect(createRelease).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      tag_name: 'v1.0.0',
      name: 'myRelease',
      body: '',
      draft: false,
      prerelease: false
    });
  });

  test('Outputs are set', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('refs/tags/v1.0.0')
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false');

    core.setOutput = jest.fn();

    await run();

    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'id', 'releaseId');
    expect(core.setOutput).toHaveBeenNthCalledWith(2, 'html_url', 'htmlUrl');
    expect(core.setOutput).toHaveBeenNthCalledWith(3, 'upload_url', 'uploadUrl');
  });

  test('Action fails elegantly', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('refs/tags/v1.0.0')
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false');

    createRelease.mockRestore();
    createRelease.mockImplementation(() => {
      throw new Error('Error creating release');
    });

    core.setOutput = jest.fn();

    core.setFailed = jest.fn();

    await run();

    expect(createRelease).toHaveBeenCalled();
    expect(core.setFailed).toHaveBeenCalledWith('Error creating release');
    expect(core.setOutput).toHaveBeenCalledTimes(0);
  });
});

/* eslint-disable no-undef */
describe('Update Release', () => {
  let updateRelease;
  let listReleases;

  beforeEach(() => {
    updateRelease = jest.fn().mockReturnValueOnce({
      data: {
        id: 'releaseId',
        owner: 'owner',
        repo: 'repo',
        html_url: 'htmlUrl',
        upload_url: 'uploadUrl',
        tag_name: 'v1.0.0',
        name: 'myRelease',
        body: 'myBody',
        draft: true,
        prerelease: false
      }
    });
    listReleases = jest.fn().mockReturnValueOnce({
      data: [
        {
          id: 'releaseId',
          owner: 'owner',
          repo: 'repo',
          tag_name: 'v1.0.0',
          name: 'myRelease',
          body: 'myBody',
          draft: true,
          prerelease: false
        }
      ]
    });

    context.repo = {
      owner: 'owner',
      repo: 'repo'
    };

    const github = {
      repos: {
        updateRelease,
        listReleases
      }
    };

    GitHub.mockImplementation(() => github);
  });

  test('List release endpoint is called', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('refs/tags/v1.0.0')
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false');

    await run();

    expect(listReleases).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo'
    });
  });

  test('Update release endpoint is called with draft', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('refs/tags/v1.0.0')
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('true')
      .mockReturnValueOnce('false');

    await run();

    expect(updateRelease).toHaveBeenCalledWith({
      release_id: 'releaseId',
      owner: 'owner',
      repo: 'repo',
      tag_name: 'v1.0.0',
      name: 'myRelease',
      body: 'myBody',
      draft: true,
      prerelease: false
    });
  });

  test('Outputs are set', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('refs/tags/v1.0.0')
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('true')
      .mockReturnValueOnce('false');

    core.setOutput = jest.fn();

    await run();

    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'id', 'releaseId');
    expect(core.setOutput).toHaveBeenNthCalledWith(2, 'html_url', 'htmlUrl');
    expect(core.setOutput).toHaveBeenNthCalledWith(3, 'upload_url', 'uploadUrl');
  });
});
