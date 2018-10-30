// user.route.js
import express from 'express';
import validate from 'express-validation';
import userCtrl from '../controllers/user.controller';
import paramValidattion from '../../config/param-validation';

const router = express.Router();

router.route('/')
  .get(userCtrl.userGet) /** 取得user */
  .post(validate(paramValidattion.createUser), userCtrl.userPost); /** 新增user */
  
router.route('/:user_id')
  .put(userCtrl.userPut) /** 更新user資料 */
  .delete(userCtrl.userDelete); /** 刪除user */

router.route('/login')
  .post(userCtrl.userLogin); /** User 登入 */

export default router;
