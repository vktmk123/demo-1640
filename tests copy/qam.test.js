const qamController = require('../controller/qam');
const bcrypt = require('bcryptjs');
const idea = require('../models/ideas');
const comment = require('../models/comments');
const student = require('../models/student');
const Account = require('../models/user');
const fs = require("fs");
const Event = require('../models/event');
bcrypt.compare = jest.fn();

jest.useFakeTimers()
const mockResponse = () => {
  const res = {};
  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.download = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

describe('Test qam controller', () => {
  describe('Test get qam', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    })
    it('it should return view route and data', async () => {
      const req = {
        session: {
          email: 'Test@gmail.com'
        }
      };
      const res = mockResponse();
      await qamController.getQAM(req, res);

      expect(res.render).toHaveBeenCalledWith("qam/qam_index", {"loginName": "Test@gmail.com"});
    })
  })

  describe('Test do change password', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    })
    it('it should change password sucessfully', async () => {
      jest.spyOn(Account, 'findOne').mockResolvedValueOnce({
        password: '123456789',
      })

      const req = {
        body: {
          current: '123456789',
          new: '12345678',
          confirm: '12345678'
        }
      }

      const res = mockResponse();
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true)


      await qamController.doChangePassword(req, res);
      expect(res.redirect).toHaveBeenCalledWith("/qam_index");
    })
  })
  describe('Test get add event', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    })
    it('it should return view route and data', async () => {
      const req = {
        session: {
          email: 'Test@gmail.com'
        }
      };
      const res = mockResponse();
      await qamController.getAddEvent(req, res);

      expect(res.render).toHaveBeenCalledWith("qam/qamAddEvent", {"loginName": "Test@gmail.com"});
    })
  })

  describe('Test do add event', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    })
    it('it should return view route and data', async () => {
      jest.spyOn(Account, 'findOne')

      const req = {
        body: {
          name: 'Test',
          description: 'Test',
        },
        session: {
          email: 'Test@gmail.com'
        }
      };
      const res = mockResponse();

      jest.spyOn(fs, 'access').mockResolvedValueOnce(true)

      jest.spyOn(Event, 'create').mockResolvedValueOnce({
        name: 'Test',
        description: 'Test',
        // co the add field bat ki vi minh dang gia lap truy van
      });

      // sau khi mock het roi, va truyen du data de pass cac logic thi goi function
      await qamController.doAddEvent(req, res);
      expect(res.redirect).toHaveBeenCalledWith("/qam_index" , { "loginName": "Test@gmail.com"});
    })
  })

  describe('Test get view event', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    })
    it('it should return view route and data', async () => {
      const req = {
        session: {
          email: 'Test@gmail.com'
        }
      };
      const res = mockResponse();
      jest.spyOn(Event, 'find').mockResolvedValueOnce([{
        name: 'lll',
        // co the add field bat ki vi minh dang gia lap truy van
      }]);
      await qamController.getViewEvent(req, res);

      expect(res.render).toHaveBeenCalledWith("qam/qamViewEvent", {"listCompare": [{"event": {"name": "lll"}, "compare": false}], "loginName": "Test@gmail.com"});
    })
  })

  describe('Test get change password', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    })
    it('it should return view route and data', async () => {
      const req = {
        session: {
          email: 'Test@gmail.com'
        }
      };
      const res = mockResponse();
      await qamController.changePassword(req, res);

      expect(res.render).toHaveBeenCalledWith("qam/changePassword", {"loginName": "Test@gmail.com"});
    })
  })

  describe('Test do search event', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    })
    it('it should return view route and data', async () => {
      const req = {
        body: {
          keyword: 'lll',
        },
        session: {
          email: 'Test@gmail.com'
        }
      };
      const res = mockResponse();

      jest.spyOn(Event, 'find').mockResolvedValueOnce([{
        name: 'lll',
        // co the add field bat ki vi minh dang gia lap truy van
      }]);

      // sau khi mock het roi, va truyen du data de pass cac logic thi goi function
      await qamController.searchEvent(req, res);
      expect(res.render).toHaveBeenCalledWith("qam/qamViewEvent", {"listCompare": [{"event": {"name": "lll"}, "compare": false}], "loginName": "Test@gmail.com"});
    })
  })
})
