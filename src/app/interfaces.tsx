export default interface CoverLetterTemplate {
    name: string,
    template: string
}

export enum CoverLetterState {
    COVER_LETTER,
    ADDITIONAL_INFO
}