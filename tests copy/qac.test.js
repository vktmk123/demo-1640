const qacController = require('../controller/qac');
const idea = require('../models/ideas');
const comment = require('../models/comments');
const student = require('../models/student');
const fs = require("fs");

jest.useFakeTimers();
const mockResponse = () => {
  const res = {};
  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.download = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  return res;
};

describe('Test QAC controller', () => {
  describe('Test get QAC', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    })
    it('it should be...', async () => {
      const req = {
        session: {
          email: 'Test@gmail.com'
        }
      };
      const res = mockResponse();
      await qacController.getQAC(req, res);

      expect(res.render).toHaveBeenCalledWith("qac/index", { "loginName": "Test@gmail.com" });
    })
  })

  describe('Test View Lastest Comment', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    })
    it('it should be...', async () => {
      jest.spyOn(comment, 'find').mockResolvedValueOnce([{
        ideaId: 1,
        author: 1
      }]);


      jest.spyOn(idea, 'findOne').mockResolvedValueOnce({
        ideaId: 1,
      })

      jest.spyOn(student, 'findOne').mockResolvedValueOnce({
        author: 1
      })

      jest.spyOn(fs, 'readdir').mockResolvedValueOnce(true);

      const req = {
        session: {
          email: 'Test',
        }
      };
      const res = mockResponse();
      await qacController.viewLastestComment(req, res);

      expect(res.render).toHaveBeenCalledWith("qac/viewLastestComment", { "lastComments_detail": [], "loginName": "Test" });
    })
  })
})
