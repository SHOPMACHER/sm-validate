import Validator from './core/Validator';
import './styles/main.less';

if (process.env.NODE_ENV === 'development') {
    const validators = Validator.init();
    Validator.attachToForm(document.querySelector('#test-form'), validators);
}

export default Validator;
