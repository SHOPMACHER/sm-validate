import Validator from './core/Validator';
import './styles/main.less';

if (process.env.NODE_ENV === 'development') {
    Validator.init();
}

export default Validator;
