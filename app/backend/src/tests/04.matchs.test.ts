import * as sinon from 'sinon';
import * as chai from 'chai';
// @ts-ignore
// Solução proposta pelo Coruja. Obrigado, Coruja!!!
import chaiHttp = require('chai-http');

import { app } from '../app';
import Matchs from '../database/models/Matchs';

import { Response } from 'superagent';

import { tokenMock } from './mocks/login';

import StatusCodes from '../helpers/StatusCode';

import { createMatchsReturnMock, createMatchsPayload,
  inProgressMatchsMock, notProgressMatchsMock,
  duplicateTeamPayload, 
  notExistTeam,
  updateMatchPayload,
  updatedMatchReturnMock,
  finishMatchMock} from './mocks/matchs';
import { afterEach } from 'mocha';


chai.use(chaiHttp);

const { expect } = chai;

let res: Response;
let resolve: string;
const authorization = 'authorization';
let token: string;
describe('Testes rota "/matchs"', () => {
  before(async () => {
    sinon
      .stub(Matchs, 'create')
      .resolves(createMatchsReturnMock as Matchs);

    sinon.stub(Matchs, 'update')
  });

  after(()=>{
    (Matchs.create as sinon.SinonStub).restore();
    (Matchs.update as sinon.SinonStub).restore();
  })

  describe('METHOD POST',() => {

    it('POST na rota "/matchs", com um token valido, retorna um status 201, com a partida criada', async () => {
      token = tokenMock;
      res = await chai.request(app)
        .post('/matchs').send(createMatchsPayload).set(authorization, token);
      resolve = JSON.stringify(createMatchsReturnMock);
  
      expect(res).to.be.status(StatusCodes.CREATED);
      expect(res.text).to.be.eq(resolve)
    });
    it('POST na rota "/matchs", com um token invalido retorna um status 401, com a mensagem de erro "Invalid token!"', async () => {
      token = 'Invalid Token!';
      res = await chai.request(app)
        .post('/matchs').send(createMatchsPayload).set(authorization, token)
      resolve = JSON.stringify({ message: "Invalid token!" })
  
      expect(res).to.be.status(StatusCodes.UNAUTHORIZED);
      expect(res.text).to.be.eq(resolve);
    });
    it('POST na rota "/matchs", sem um token retorna um status 401, com a mensagem de erro "Token not found"', async () => {
      token = '';
      res = await chai.request(app)
        .post('/matchs').send(createMatchsPayload).set(authorization, token);
      resolve = JSON.stringify({ message: "Token not found!" });
  
      expect(res).to.be.status(StatusCodes.UNAUTHORIZED);
      expect(res.text).to.be.eq(resolve);
    });
    it('POST na rota "/matchs", com times repetidos retorna um status 401, com a messagem de erro "It is not possible to create a match with two equal teams" ', async () => {
      token = tokenMock;
      res = await chai.request(app)
        .post('/matchs').send(duplicateTeamPayload).set(authorization, token);
      resolve = JSON
        .stringify({message: "It is not possible to create a match with two equal teams"});
      expect(res).to.be.status(StatusCodes.UNAUTHORIZED);
      expect(res.text).to.be.eq(resolve);
    });
    it('POST na rota "/matchs", com time que n retorna um status 401, com a messagem de erro "There is no team with such id!" ', async () => {
      token = tokenMock;
      res = await chai.request(app)
        .post('/matchs').send(notExistTeam).set(authorization, token);
      resolve = JSON
        .stringify({message: "There is no team with such id!"});
      expect(res).to.be.status(StatusCodes.UNAUTHORIZED);
      expect(res.text).to.be.eq(resolve);
    });
  })
  describe('METHOD GET',() => {
    before(() => {
      sinon.stub(Matchs, 'findAll')
        .onFirstCall().resolves(inProgressMatchsMock as unknown as Matchs[])
        .onSecondCall().resolves(notProgressMatchsMock as unknown as Matchs[]);
    });

    after(() => {
      (Matchs.findAll as sinon.SinonStub).restore();
    });

    it('GET na rota "/matchs?inProgres=true", retorna um status 200, com a lista de todas as partidas em progresso', async () => {
      res = await chai.request(app)
        .get('/matchs').query({inProgress: true});
      resolve = JSON.stringify(inProgressMatchsMock);
      expect(res.text).to.be.eq(resolve);
    });
    it('GET na rota "/matchs?inProgres=false" retorna um status 200, com a lista de todas as partidas que não estão em progresso', async () => {
      res = await chai.request(app)
        .get('/matchs').query({inProgress: false});
      resolve = JSON.stringify(notProgressMatchsMock);
      expect(res.text).to.be.eq(resolve);
    });
  })
  describe('METHOD PATCH', () => {
    afterEach(() => {
      (Matchs.findOne as sinon.SinonStub).restore();
    })
    it('"/matchs/:id" com o corpo da requisição valido, retorna um status 200, com o partida atualizada', async () => {
      sinon.stub(Matchs, 'findOne').resolves(updatedMatchReturnMock as Matchs);

      res = await chai.request(app)
        .patch('/matchs/47').send(updateMatchPayload);
      
      expect(res).to.have.a.status(StatusCodes.OK);
    });
    it('PATCH na rota "/matchs/:id/finish" com o corpo da requisição valido, retorna um status 200, com o partida atualizada', async () => {
      sinon.stub(Matchs, 'findOne').resolves(finishMatchMock as Matchs);
      
      res = await chai.request(app)
        .patch('/matchs/47/finish');

      expect(res).to.have.a.status(StatusCodes.OK);

    });
  })
});