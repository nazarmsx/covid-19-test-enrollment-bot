import { injectable } from "tsyringe";
import moment from "moment";

export interface FlowStep {
    key: string;
    targetField: string;
    type: string;
    buttons?: Button[];
    btnSeparateRow?: boolean,
    keyBoardType?: 'inline' | 'keyboard';
    isLast?: boolean;
}

export interface Button {
    value: any;
    key: string;
    type?: string;
    url?: string;
}

@injectable()
export class BotFlow {
    public getBotFlowSteps(): FlowStep[] {
        return [
            {
                key: 'getLanguage',
                targetField: 'lang',
                type: 'btn',
                buttons: [
                    {
                        value: 'uk',
                        key: 'setLangUk'
                    },
                    {
                        value: 'ru',
                        key: 'setLangRu'
                    }
                ]
            },
            {
                key: 'getPhoneNumber',
                targetField: 'phoneNumber',
                type: 'string',
                keyBoardType: 'keyboard',
                buttons: [
                    {
                        value: '',
                        key: 'getPhoneNumber',
                        type: 'contact'
                    },
                ]
            },
            {
                key: 'getName',
                targetField: 'name',
                type: 'string'
            },
            {
                key: 'getPassType',
                targetField: 'passType',
                type: 'btn',
                buttons: [
                    {
                        value: 'finishedTest',
                        key: 'getPassTypeFinished'
                    },
                    {
                        value: 'expressTest',
                        key: 'getPassTypeExpress'
                    }
                ]
            },
            {
                key: 'getFile',
                targetField: 'fileName',
                type: 'file'
            },
            {
                key: 'getFile',
                targetField: 'fileName',
                type: 'file'
            },
        ];
    }
}
