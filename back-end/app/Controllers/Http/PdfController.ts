import {Template, generate} from '@pdfme/generator'
import Cat from 'App/Models/Cat'
import {writeFileSync} from 'fs'
import Env from '@ioc:Adonis/Core/Env'
import CatTreeService from 'App/Services/CatTreeService'
import {fromBase64} from 'pdf2pic';

export default class PdfController {
  public getCatInfo(cat: any): string {
    return (
      (cat.code ? cat.code : '') +
      ' ' +
      (cat.color_code ? cat.color_code : '') +
      '\n' +
      (cat.date_of_birth ? cat.date_of_birth : '')
    )
  }

  public trimCatInfo(cat: string): string {
    if (cat.length < 50) {
      return cat
    } else {
      return (cat.substring(0, 43) + '...')
    }
  }

  async getPedigreePdf({request}) {
    try {
      let catId = atob(request.params().id)

      let cat = await Cat.query()
        .preload('history')
        .preload('breed')
        .preload('information')
        .preload('links')
        .where('id', catId)
        .first()
      if (cat === null) throw new Error('Cat not found')

      let pedigreeGenerations = 3

      let pedigree = await CatTreeService.getTree(parseInt(catId), pedigreeGenerations)
      let pedigreePdf = {cat: cat?.serialize(), pedigree: pedigree}

      const template: Template = this.treeTemplate()

      const inputs = [
        {
          'name': pedigreePdf.cat.name ?? (pedigreePdf.cat.name || ''),
          'reg_no': pedigreePdf.cat.regNumCurrent ?? (pedigreePdf.cat.regNumCurrent || ''),
          'chip_no': pedigreePdf.cat.additionalInfo?.chip ?? (pedigreePdf.cat.additionalInfo?.chip || ''),
          'cattery': pedigreePdf.cat.additionalInfo?.cattery
            ?? (pedigreePdf.cat.additionalInfo?.cattery || ''),
          'birth_date': pedigreePdf.cat.dateOfBirth ?? (pedigreePdf.cat.dateOfBirth || ''),
          'sex': pedigreePdf.cat.gender ?? (pedigreePdf.cat.gender || ''),
          'breed': pedigreePdf.cat.breed.code ?? (pedigreePdf.cat.breed.code || ''),
          'current_country': pedigreePdf.cat.countryCurrent ?? (pedigreePdf.cat.countryCurrent || ''),
          'origin_country': pedigreePdf.cat.countryOrigin ?? (pedigreePdf.cat.countryOrigin || ''),
          'ems': pedigreePdf.cat.color ?? (pedigreePdf.cat.color || ''),
          'name_1_1': this.trimCatInfo(pedigreePdf.pedigree[0].name ?? ''),
          'name_1_2': this.trimCatInfo(pedigreePdf.pedigree[1].name ?? ''),
          'name_2_1': this.trimCatInfo(pedigreePdf.pedigree[2].name ?? ''),
          'name_2_2': this.trimCatInfo(pedigreePdf.pedigree[3].name ?? ''),
          'name_2_3': this.trimCatInfo(pedigreePdf.pedigree[4].name ?? ''),
          'name_2_4': this.trimCatInfo(pedigreePdf.pedigree[5].name ?? ''),
          'name_3_1 ': this.trimCatInfo(pedigreePdf.pedigree[6].name ?? ''),
          'name_3_2': this.trimCatInfo(pedigreePdf.pedigree[7].name ?? ''),
          'name_3_3': this.trimCatInfo(pedigreePdf.pedigree[8].name ?? ''),
          'name_3_4': this.trimCatInfo(pedigreePdf.pedigree[9].name ?? ''),
          'name_3_5': this.trimCatInfo(pedigreePdf.pedigree[10].name ?? ''),
          'name_3_6': this.trimCatInfo(pedigreePdf.pedigree[11].name ?? ''),
          'name_3_7': this.trimCatInfo(pedigreePdf.pedigree[12].name ?? ''),
          'name_3_8': this.trimCatInfo(pedigreePdf.pedigree[13].name ?? ''),
          'name_1_1_info': this.getCatInfo(pedigreePdf.pedigree[0]),
          'name_1_2_info': this.getCatInfo(pedigreePdf.pedigree[1]),
          'name_2_1_info': this.getCatInfo(pedigreePdf.pedigree[2]),
          'name_2_2_info': this.getCatInfo(pedigreePdf.pedigree[3]),
          'name_2_3_info': this.getCatInfo(pedigreePdf.pedigree[4]),
          'name_2_4_info': this.getCatInfo(pedigreePdf.pedigree[5]),
          'name_3_1_info': this.getCatInfo(pedigreePdf.pedigree[6]),
          'name_3_2_info': this.getCatInfo(pedigreePdf.pedigree[7]),
          'name_3_3_info': this.getCatInfo(pedigreePdf.pedigree[8]),
          'name_3_4_info': this.getCatInfo(pedigreePdf.pedigree[9]),
          'name_3_5_info': this.getCatInfo(pedigreePdf.pedigree[10]),
          'name_3_6_info': this.getCatInfo(pedigreePdf.pedigree[11]),
          'name_3_7_info': this.getCatInfo(pedigreePdf.pedigree[12]),
          'name_3_8_info': this.getCatInfo(pedigreePdf.pedigree[13]),
        },
      ]

      const options = {
        density: 300,
        saveFilename: 'pedigreeCatId' + catId,
        savePath: 'public',
        format: 'jpg',
        width: 2480,
        height: 3508
      };

      await generate({template, inputs}).then((pdf) => {
        writeFileSync('public/pedigreeCatId' + catId + '.pdf', pdf)
        // @ts-ignore
        const storeAsImage = fromBase64(pdf, options);
        storeAsImage(1).then((resolve) => {
          return resolve
        });
      })


      let pdfUrl
      let jpgUrl
      if (Env.get('NODE_ENV') === 'production') {
        pdfUrl = 'https://api.infocat.info/pedigreeCatId' + catId + '.pdf'
        jpgUrl = 'https://api.infocat.info/pedigreeCatId' + catId + '.1.jpg'
      } else {
        pdfUrl = 'http://127.0.0.1:3333/pedigreeCatId' + catId + '.pdf'
        jpgUrl = 'http://127.0.0.1:3333/pedigreeCatId' + catId + '.1.jpg'
      }
      return {path_to_pdf: pdfUrl, path_to_jpg: jpgUrl}
    } catch (error) {
      return {
        error: error.message,
      }
    }
  }

  private treeTemplate(): Template {
    return {
      schemas: [
        {
          'name': {
            type: 'text',
            position: {
              x: 30.18,
              y: 33.66,
            },
            width: 84,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'reg_no': {
            type: 'text',
            position: {
              x: 55,
              y: 40.49,
            },
            width: 58.6,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'chip_no': {
            type: 'text',
            position: {
              x: 47.54,
              y: 46.79,
            },
            width: 66.53,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'cattery': {
            type: 'text',
            position: {
              x: 33.46,
              y: 53.62,
            },
            width: 80.81,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'birth_date': {
            type: 'text',
            position: {
              x: 45.58,
              y: 60.18,
            },
            width: 68.64,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'sex': {
            type: 'text',
            position: {
              x: 127.02,
              y: 33.93,
            },
            width: 70.76,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'breed': {
            type: 'text',
            position: {
              x: 131.73,
              y: 40.23,
            },
            width: 66.26,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'current_country': {
            type: 'text',
            position: {
              x: 155.59,
              y: 46.52,
            },
            width: 41.92,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'origin_country': {
            type: 'text',
            position: {
              x: 157.92,
              y: 53.61,
            },
            width: 39.8,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'ems': {
            type: 'text',
            position: {
              x: 129.29,
              y: 60.17,
            },
            width: 68.37,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'name_1_1': {
            type: 'text',
            position: {
              x: 14.58,
              y: 113.34,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'name_1_2': {
            type: 'text',
            position: {
              x: 14.58,
              y: 197.69,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'name_2_1': {
            type: 'text',
            position: {
              x: 75.64,
              y: 92.65,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'name_2_2': {
            type: 'text',
            position: {
              x: 75.64,
              y: 134.93,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'name_2_3': {
            type: 'text',
            position: {
              x: 75.64,
              y: 176.68,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'name_2_4': {
            type: 'text',
            position: {
              x: 75.64,
              y: 217.9,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'name_3_1 ': {
            type: 'text',
            position: {
              x: 136.97,
              y: 81.75,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'name_3_2': {
            type: 'text',
            position: {
              x: 136.97,
              y: 103.65,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'name_3_3': {
            type: 'text',
            position: {
              x: 136.97,
              y: 122.65,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'name_3_4': {
            type: 'text',
            position: {
              x: 136.97,
              y: 144.03,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'name_3_5': {
            type: 'text',
            position: {
              x: 136.97,
              y: 165.41,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'name_3_6': {
            type: 'text',
            position: {
              x: 136.97,
              y: 187.05,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'name_3_7': {
            type: 'text',
            position: {
              x: 136.97,
              y: 207.9,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'name_3_8': {
            type: 'text',
            position: {
              x: 136.97,
              y: 227.69,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 12,
            characterSpacing: 0,
            lineHeight: 0.9
          },
          'name_1_1_info': {
            type: 'text',
            position: {
              x: 14.58,
              y: 126.16,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 10,
            characterSpacing: 0,
            lineHeight: 1,
          },
          'name_1_2_info': {
            type: 'text',
            position: {
              x: 14.58,
              y: 210.51,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 10,
            characterSpacing: 0,
            lineHeight: 1,
          },
          'name_2_1_info': {
            type: 'text',
            position: {
              x: 75.64,
              y: 105.42,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 10,
            characterSpacing: 0,
            lineHeight: 1,
          },
          'name_2_2_info': {
            type: 'text',
            position: {
              x: 75.64,
              y: 147.96,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 10,
            characterSpacing: 0,
            lineHeight: 1,
          },
          'name_2_3_info': {
            type: 'text',
            position: {
              x: 75.64,
              y: 189.45,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 10,
            characterSpacing: 0,
            lineHeight: 1,
          },
          'name_2_4_info': {
            type: 'text',
            position: {
              x: 75.64,
              y: 230.4,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 10,
            characterSpacing: 0,
            lineHeight: 1,
          },
          'name_3_1_info': {
            type: 'text',
            position: {
              x: 136.97,
              y: 94.09,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 10,
            characterSpacing: 0,
            lineHeight: 1,
          },
          'name_3_2_info': {
            type: 'text',
            position: {
              x: 136.97,
              y: 114.26,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 10,
            characterSpacing: 0,
            lineHeight: 1,
          },
          'name_3_3_info': {
            type: 'text',
            position: {
              x: 136.97,
              y: 133.79,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 10,
            characterSpacing: 0,
            lineHeight: 1,
          },
          'name_3_4_info': {
            type: 'text',
            position: {
              x: 136.97,
              y: 154.9,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 10,
            characterSpacing: 0,
            lineHeight: 1,
          },
          'name_3_5_info': {
            type: 'text',
            position: {
              x: 136.97,
              y: 176.28,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 10,
            characterSpacing: 0,
            lineHeight: 1,
          },
          'name_3_6_info': {
            type: 'text',
            position: {
              x: 136.97,
              y: 197.66,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 10,
            characterSpacing: 0,
            lineHeight: 1,
          },
          'name_3_7_info': {
            type: 'text',
            position: {
              x: 136.97,
              y: 219.04,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 10,
            characterSpacing: 0,
            lineHeight: 1,
          },
          'name_3_8_info': {
            type: 'text',
            position: {
              x: 136.97,
              y: 238.83,
            },
            width: 58.58,
            height: 6,
            alignment: 'left',
            fontSize: 10,
            characterSpacing: 0,
            lineHeight: 1,
          },
        },
      ],
      basePdf:
        'data:application/pdf;base64,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MCBvYmoNCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1RydWVUeXBlL05hbWUvRjIvQmFzZUZvbnQvQkNERUVFK0NhbGlicmkvRW5jb2RpbmcvV2luQW5zaUVuY29kaW5nL0ZvbnREZXNjcmlwdG9yIDEyIDAgUi9GaXJzdENoYXIgMzIvTGFzdENoYXIgMTE5L1dpZHRocyAxMDUgMCBSPj4NCmVuZG9iag0KMTIgMCBvYmoNCjw8L1R5cGUvRm9udERlc2NyaXB0b3IvRm9udE5hbWUvQkNERUVFK0NhbGlicmkvRmxhZ3MgMzIvSXRhbGljQW5nbGUgMC9Bc2NlbnQgNzUwL0Rlc2NlbnQgLTI1MC9DYXBIZWlnaHQgNzUwL0F2Z1dpZHRoIDUyMS9NYXhXaWR0aCAxNzQzL0ZvbnRXZWlnaHQgNDAwL1hIZWlnaHQgMjUwL1N0ZW1WIDUyL0ZvbnRCQm94WyAtNTAzIC0yNTAgMTI0MCA3NTBdIC9Gb250RmlsZTIgMTA2IDAgUj4+DQplbmRvYmoNCjEzIDAgb2JqDQo8PC9UeXBlL0ZvbnQvU3VidHlwZS9UcnVlVHlwZS9OYW1lL0YzL0Jhc2VGb250L0hlbHZldGljYS9FbmNvZGluZy9XaW5BbnNpRW5jb2RpbmcvRm9udERlc2NyaXB0b3IgMTQgMCBSL0ZpcnN0Q2hhciAzMi9MYXN0Q2hhciAxMjEvV2lkdGhzIDEwNyAwIFI+Pg0KZW5kb2JqDQoxNCAwIG9iag0KPDwvVHlwZS9Gb250RGVzY3JpcHRvci9Gb250TmFtZS9IZWx2ZXRpY2EvRmxhZ3MgMzIvSXRhbGljQW5nbGUgMC9Bc2NlbnQgOTA1L0Rlc2NlbnQgLTIxMC9DYXBIZWlnaHQgNzI4L0F2Z1dpZHRoIDQ0MS9NYXhXaWR0aCAyNjY1L0ZvbnRXZWlnaHQgNDAwL1hIZWlnaHQgMjUwL0xlYWRpbmcgMzMvU3RlbVYgNDQvRm9udEJCb3hbIC02NjUgLTIxMCAyMDAwIDcyOF0gPj4NCmVuZG9iag0KMTUgMCBvYmoNCjw8L1N1YnR5cGUvTGluay9SZWN0WyA0NTguNjIgNDcuMDk0IDU2MS41NSA2MS43NDJdIC9CUzw8L1cgMD4+L0YgNC9BPDwvVHlwZS9BY3Rpb24vUy9VUkkvVVJJKGh0dHBzOi8vaW5mb2NhdC5pbmZvLykgPj4vU3RydWN0UGFyZW50IDE+Pg0KZW5kb2JqDQoxNiAwIG9iag0KPDwvVHlwZS9YT2JqZWN0L1N1YnR5cGUvSW1hZ2UvV2lkdGggMTQvSGVpZ2h0IDE0L0NvbG9yU3BhY2UvRGV2aWNlUkdCL0JpdHNQZXJDb21wb25lbnQgOC9JbnRlcnBvbGF0ZSBmYWxzZS9TTWFzayAxNyAwIFIvRmlsdGVyL0ZsYXRlRGVjb2RlL0xlbmd0aCAxNT4+DQpzdHJlYW0NCnicY2AYBaOAOgAAAkwAAQ0KZW5kc3RyZWFtDQplbmRvYmoNCjE3IDAgb2JqDQo8PC9UeXBlL1hPYmplY3QvU3VidHlwZS9JbWFnZS9XaWR0aCAxNC9IZWlnaHQgMTQvQ29sb3JTcGFjZS9EZXZpY2VHcmF5L0JpdHNQZXJDb21wb25lbnQgMS9MZW5ndGggMjg+Pg0Kc3RyZWFtDQoECAgQECAgQECAgQCBAECAIEAQIAgQBAgCBAIIDQplbmRzdHJlYW0NCmVuZG9iag0KMTggMCBvYmoNCjw8L1R5cGUvWE9iamVjdC9TdWJ0eXBlL0ltYWdlL1dpZHRoIDE0L0hlaWdodCAxNC9Db2xvclNwYWNlL0RldmljZVJHQi9CaXRzUGVyQ29tcG9uZW50IDgvSW50ZXJwb2xhdGUgZmFsc2UvU01hc2sgMTkgMCBSL0ZpbHRlci9GbGF0ZURlY29kZS9MZW5ndGggMTU+Pg0Kc3RyZWFtDQp4nGNgGAWjgDoAAAJMAAENCmVuZHN0cmVhbQ0KZW5kb2JqDQoxOSAwIG9iag0KPDwvVHlwZS9YT2JqZWN0L1N1YnR5cGUvSW1hZ2UvV2lkdGggMTQvSGVpZ2h0IDE0L0NvbG9yU3BhY2UvRGV2aWNlR3JheS9CaXRzUGVyQ29tcG9uZW50IDEvRmlsdGVyL0ZsYXRlRGVjb2RlL0xlbmd0aCAyNT4+DQpzdHJlYW0NCnicY5BoUHFwUGgQZOBiYGFgQOEBAEEKA/cNCmVuZHN0cmVhbQ0KZW5kb2JqDQoyMCAwIG9iag0KPDwvVHlwZS9YT2JqZWN0L1N1YnR5cGUvSW1hZ2UvV2lkdGggMy9IZWlnaHQgMTQvQ29sb3JTcGFjZS9EZXZpY2VSR0IvQml0c1BlckNvbXBvbmVudCA4L0ludGVycG9sYXRlIGZhbHNlL1NNYXNrIDIxIDAgUi9GaWx0ZXIvRmxhdGVEZWNvZGUvTGVuZ3RoIDEyPj4NCnN0cmVhbQ0KeJxjYBhIAAAAfgABDQplbmRzdHJlYW0NCmVuZG9iag0KMjEgMCBvYmoNCjw8L1R5cGUvWE9iamVjdC9TdWJ0eXBlL0ltYWdlL1dpZHRoIDMvSGVpZ2h0IDE0L0NvbG9yU3BhY2UvRGV2aWNlR3JheS9CaXRzUGVyQ29tcG9uZW50IDEvTGVuZ3RoIDE0Pj4NCnN0cmVhbQ0KAIAAAAAAAACAQCAAAAANCmVuZHN0cmVhbQ0KZW5kb2JqDQoyMiAwIG9iag0KPDwvVHlwZS9YT2JqZWN0L1N1YnR5cGUvSW1hZ2UvV2lkdGggMTQvSGVpZ2h0IDMvQ29sb3JTcGFjZS9EZXZpY2VSR0IvQml0c1BlckNvbXBvbmVudCA4L0ludGVycG9sYXRlIGZhbHNlL1NNYXNrIDIzIDAgUi9GaWx0ZXIvRmxhdGVEZWNvZGUvTGVuZ3RoIDEyPj4NCnN0cmVhbQ0KeJxjYBhIAAAAfgABDQplbmRzdHJlYW0NCmVuZG9iag0KMjMgMCBvYmoNCjw8L1R5cGUvWE9iamVjdC9TdWJ0eXBlL0ltYWdlL1dpZHRoIDE0L0hlaWdodCAzL0NvbG9yU3BhY2UvRGV2aWNlR3JheS9CaXRzUGVyQ29tcG9uZW50IDEvTGVuZ3RoIDY+Pg0Kc3RyZWFtDQoECAgQECANCmVuZHN0cmVhbQ0KZW5kb2JqDQoyNCAwIG9iag0KPDwvVHlwZS9YT2JqZWN0L1N1YnR5cGUvSW1hZ2UvV2lkdGggMTQvSGVpZ2h0IDE0L0NvbG9yU3BhY2UvRGV2aWNlUkdCL0JpdHNQZXJDb21wb25lbnQgOC9JbnRlcnBvbGF0ZSBmYWxzZS9TTWFzayAyNSAwIFIvRmlsdGVyL0ZsYXRlRGVjb2RlL0xlbmd0aCAxNT4+DQpzdHJlYW0NCnicY2AYBaOAOgAAAkwAAQ0KZW5kc3RyZWFtDQplbmRvYmoNCjI1IDAgb2JqDQo8PC9UeXBlL1hPYmplY3QvU3VidHlwZS9JbWFnZS9XaWR0aCAxNC9IZWlnaHQgMTQvQ29s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lFwdLUfFmbjHLPJaYrNaV0kwRYm34Y6K3OANsMR1+Qg21upKh/X7PVhymEDX+ROIlzBimEdO0QCWas5yr/HtdfvazXjSLfqBt1rBopzuUBhNFoolfvlBBlTW5tSQm6mdAk6TJ+118p3RCvTq1++0Pc/fpUEcK/iwcPurniQk/wLM6XrtDQplbmRzdHJlYW0NCmVuZG9iag0KMTA3IDAgb2JqDQpbIDI3OCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDI3OCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMjc4IDAgMCAwIDAgMCAwIDAgNjY3IDcyMiA3MjIgNjY3IDAgMCAwIDAgMCAwIDAgODMzIDcyMiAwIDAgMCAwIDY2NyAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDU1NiA1NTYgNTAwIDU1NiA1NTYgMjc4IDU1NiA1NTYgMjIyIDAgMCAwIDgzMyA1NTYgNTU2IDU1NiAwIDMzMyAwIDI3OCA1NTYgMCAwIDUwMCA1MDBdIA0KZW5kb2JqDQoxMDggMCBvYmoNCjw8L1R5cGUvTWV0YWRhdGEvU3VidHlwZS9YTUwvTGVuZ3RoIDMwMDY+Pg0Kc3RyZWFtDQo8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IjMuMS03MDEiPgo8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgo8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiAgeG1sbnM6cGRmPSJodHRwOi8vbnMuYWRvYmUuY29tL3BkZi8xLjMvIj4KPC9yZGY6RGVzY3JpcHRpb24+CjxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iPgo8ZGM6Y3JlYXRvcj48cmRmOlNlcT48cmRmOmxpPk1hdGVqIEt1csOhxYg8L3JkZjpsaT48L3JkZjpTZXE+PC9kYzpjcmVhdG9yPjwvcmRmOkRlc2NyaXB0aW9uPgo8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIj4KPHhtcDpDcmVhdG9yVG9vbD5NaWNyb3NvZnQgV29yZDwveG1wOkNyZWF0b3JUb29sPjx4bXA6Q3JlYXRlRGF0ZT4yMDIzLTAzLTE4VDEwOjUwOjA1KzAwOjAwPC94bXA6Q3JlYXRlRGF0ZT48eG1wOk1vZGlmeURhdGU+MjAyMy0wMy0xOFQxMDo1MDowNSswMDowMDwveG1wOk1vZGlmeURhdGU+PC9yZGY6RGVzY3JpcHRpb24+CjxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyI+Cjx4bXBNTTpEb2N1bWVudElEPnV1aWQ6QTUyMzc1QkEtRkUyNS00QjMwLUI1MTEtNjI4Q0FGNUNCN0ExPC94bXBNTTpEb2N1bWVudElEPjx4bXBNTTpJbnN0YW5jZUlEPnV1aWQ6QTUyMzc1QkEtRkUyNS00QjMwLUI1MTEtNjI4Q0FGNUNCN0ExPC94bXBNTTpJbnN0YW5jZUlEPjwvcmRmOkRlc2NyaXB0aW9uPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPC9yZGY6UkRGPjwveDp4bXBtZXRhPjw/eHBhY2tldCBlbmQ9InciPz4NCmVuZHN0cmVhbQ0KZW5kb2JqDQoxMDkgMCBvYmoNCjw8L0Rpc3BsYXlEb2NUaXRsZSB0cnVlPj4NCmVuZG9iag0KMTEwIDAgb2JqDQo8PC9UeXBlL1hSZWYvU2l6ZSAxMTAvV1sgMSA0IDJdIC9Sb290IDEgMCBSL0luZm8gMjYgMCBSL0lEWzxCQTc1MjNBNTI1RkUzMDRCQjUxMTYyOENBRjVDQjdBMT48QkE3NTIzQTUyNUZFMzA0QkI1MTE2MjhDQUY1Q0I3QTE+XSAvRmlsdGVyL0ZsYXRlRGVjb2RlL0xlbmd0aCAyNjk+Pg0Kc3RyZWFtDQp4nDXSuU7CQRDH8QUEL1RA8D6Rmz+nIvwVBQ/Ao/UtLE18CB/B2kITG1t9AUsfQWNpLGxtcP19dYr9ZHdnkklmjLHR73vsGTbml1t4Fd5LEe2J2JVI3MObSPKYuoA7kT4TmQ58iOyLyJ2LvAvvwnkQBf6KNaCgdC3KDnyLyo3tzvYZNz04gmM4gS78ZZ7aumr7/+YBL/hgAPwQgEEYgmHYgjCEYBRGYAyCMAHj4MIURGASYhCFBZiGWZiBeZiDVViEJViBZcjAGsQhCQlIQwoKkIUcOJCHdShCGUpQhQo0YANqUIdN2IYm7MAutKADbTiAPdiHQzvpelOL0ogINyAeP8XTl3j2GfMDT9wvag0KZW5kc3RyZWFtDQplbmRvYmoNCnhyZWYNCjAgMTExDQowMDAwMDAwMDI3IDY1NTM1IGYNCjAwMDAwMDAwMTcgMDAwMDAgbg0KMDAwMDAwMDE2OCAwMDAwMCBuDQowMDAwMDAwMjI0IDAwMDAwIG4NCjAwMDAwMDA2MzAgMDAwMDAgbg0KMDAwMDAwNTE5MSAwMDAwMCBuDQowMDAwMDA1NTE0IDAwMDAwIG4NCjAwMDAwMDkzODggMDAwMDAgbg0KMDAwMDAwOTQ0MSAwMDAwMCBuDQowMDAwMDA5NjEwIDAwMDAwIG4NCjAwMDAwMDk4NDMgMDAwMDAgbg0KMDAwMDAwOTg5NyAwMDAwMCBuDQowMDAwMDEwMDY4IDAwMDAwIG4NCjAwMDAwMTAzMDkgMDAwMDAgbg0KMDAwMDAxMDQ3NSAwMDAwMCBuDQowMDAwMDEwNzA0IDAwMDAwIG4NCjAwMDAwMTA4NTkgMDAwMDAgbg0KMDAwMDAxMTA2NSAwMDAwMCBuDQowMDAwMDExMjM1IDAwMDAwIG4NCjAwMDAwMTE0NDEgMDAwMDAgbg0KMDAwMDAxMTYyNyAwMDAwMCBuDQowMDAwMDExODI5IDAwMDAwIG4NCjAwMDAwMTE5ODQgMDAwMDAgbg0KMDAwMDAxMjE4NiAwMDAwMCBuDQowMDAwMDEyMzMyIDAwMDAwIG4NCjAwMDAwMTI1MzggMDAwMDAgbg0KMDAwMDAxMjcwOCAwMDAwMCBuDQowMDAwMDAwMDI4IDY1NTM1IGYNCjAwMDAwMDAwMjkgNjU1MzUgZg0KMDAwMDAwMDAzMCA2NTUzNSBmDQowMDAwMDAwMDMxIDY1NTM1IGYNCjAwMDAwMDAwMzIgNjU1MzUgZg0KMDAwMDAwMDAzMyA2NTUzNSBmDQowMDAwMDAwMDM0IDY1NTM1IGYNCjAwMDAwMDAwMzUgNjU1MzUgZg0KMDAwMDAwMDAzNiA2NTUzNSBmDQowMDAwMDAwMDM3IDY1NTM1IGYNCjAwMDAwMDAwMzggNjU1MzUgZg0KMDAwMDAwMDAzOSA2NTUzNSBmDQowMDAwMDAwMDQwIDY1NTM1IGYNCjAwMDAwMDAwNDEgNjU1MzUgZg0KMDAwMDAwMDA0MiA2NTUzNSBmDQowMDAwMDAwMDQzIDY1NTM1IGYNCjAwMDAwMDAwNDQgNjU1MzUgZg0KMDAwMDAwMDA0NSA2NTUzNSBmDQowMDAwMDAwMDQ2IDY1NTM1IGYNCjAwMDAwMDAwNDcgNjU1MzUgZg0KMDAwMDAwMDA0OCA2NTUzNSBmDQowMDAwMDAwMDQ5IDY1NTM1IGYNCjAwMDAwMDAwNTAgNjU1MzUgZg0KMDAwMDAwMDA1MSA2NTUzNSBmDQowMDAwMDAwMDUyIDY1NTM1IGYNCjAwMDAwMDAwNTMgNjU1MzUgZg0KMDAwMDAwMDA1NCA2NTUzNSBmDQowMDAwMDAwMDU1IDY1NTM1IGYNCjAwMDAwMDAwNTYgNjU1MzUgZg0KMDAwMDAwMDA1NyA2NTUzNSBmDQowMDAwMDAwMDU4IDY1NTM1IGYNCjAwMDAwMDAwNTkgNjU1MzUgZg0KMDAwMDAwMDA2MCA2NTUzNSBmDQowMDAwMDAwMDYxIDY1NTM1IGYNCjAwMDAwMDAwNjIgNjU1MzUgZg0KMDAwMDAwMDA2MyA2NTUzNSBmDQowMDAwMDAwMDY0IDY1NTM1IGYNCjAwMDAwMDAwNjUgNjU1MzUgZg0KMDAwMDAwMDA2NiA2NTUzNSBmDQowMDAwMDAwMDY3IDY1NTM1IGYNCjAwMDAwMDAwNjggNjU1MzUgZg0KMDAwMDAwMDA2OSA2NTUzNSBmDQowMDAwMDAwMDcwIDY1NTM1IGYNCjAwMDAwMDAwNzEgNjU1MzUgZg0KMDAwMDAwMDA3MiA2NTUzNSBmDQowMDAwMDAwMDczIDY1NTM1IGYNCjAwMDAwMDAwNzQgNjU1MzUgZg0KMDAwMDAwMDA3NSA2NTUzNSBmDQowMDAwMDAwMDc2IDY1NTM1IGYNCjAwMDAwMDAwNzcgNjU1MzUgZg0KMDAwMDAwMDA3OCA2NTUzNSBmDQowMDAwMDAwMDc5IDY1NTM1IGYNCjAwMDAwMDAwODAgNjU1MzUgZg0KMDAwMDAwMDA4MSA2NTUzNSBmDQowMDAwMDAwMDgyIDY1NTM1IGYNCjAwMDAwMDAwODMgNjU1MzUgZg0KMDAwMDAwMDA4NCA2NTUzNSBmDQowMDAwMDAwMDg1IDY1NTM1IGYNCjAwMDAwMDAwODYgNjU1MzUgZg0KMDAwMDAwMDA4NyA2NTUzNSBmDQowMDAwMDAwMDg4IDY1NTM1IGYNCjAwMDAwMDAwODkgNjU1MzUgZg0KMDAwMDAwMDA5MCA2NTUzNSBmDQowMDAwMDAwMDkxIDY1NTM1IGYNCjAwMDAwMDAwOTIgNjU1MzUgZg0KMDAwMDAwMDA5MyA2NTUzNSBmDQowMDAwMDAwMDk0IDY1NTM1IGYNCjAwMDAwMDAwOTUgNjU1MzUgZg0KMDAwMDAwMDA5NiA2NTUzNSBmDQowMDAwMDAwMDk3IDY1NTM1IGYNCjAwMDAwMDAwOTggNjU1MzUgZg0KMDAwMDAwMDA5OSA2NTUzNSBmDQowMDAwMDAwMTAwIDY1NTM1IGYNCjAwMDAwMDAxMDEgNjU1MzUgZg0KMDAwMDAwMDEwMiA2NTUzNSBmDQowMDAwMDAwMTAzIDY1NTM1IGYNCjAwMDAwMDAwMDAgNjU1MzUgZg0KMDAwMDAxNDE0MCAwMDAwMCBuDQowMDAwMDE0MzU0IDAwMDAwIG4NCjAwMDAwMTQ1OTggMDAwMDAgbg0KMDAwMDA0Nzg1MyAwMDAwMCBuDQowMDAwMDQ4MTEzIDAwMDAwIG4NCjAwMDAwNTEyMDMgMDAwMDAgbg0KMDAwMDA1MTI0OSAwMDAwMCBuDQp0cmFpbGVyDQo8PC9TaXplIDExMS9Sb290IDEgMCBSL0luZm8gMjYgMCBSL0lEWzxCQTc1MjNBNTI1RkUzMDRCQjUxMTYyOENBRjVDQjdBMT48QkE3NTIzQTUyNUZFMzA0QkI1MTE2MjhDQUY1Q0I3QTE+XSA+Pg0Kc3RhcnR4cmVmDQo1MTcyMQ0KJSVFT0YNCnhyZWYNCjAgMA0KdHJhaWxlcg0KPDwvU2l6ZSAxMTEvUm9vdCAxIDAgUi9JbmZvIDI2IDAgUi9JRFs8QkE3NTIzQTUyNUZFMzA0QkI1MTE2MjhDQUY1Q0I3QTE+PEJBNzUyM0E1MjVGRTMwNEJCNTExNjI4Q0FGNUNCN0ExPl0gL1ByZXYgNTE3MjEvWFJlZlN0bSA1MTI0OT4+DQpzdGFydHhyZWYNCjU0MTAwDQolJUVPRg==',
    } as Template
  }
}
