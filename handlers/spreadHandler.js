// handlers/spreadHandler.js
const supabase = require('../supabaseClient');

//Этот эндпоинт будет отдавать историю раскладов пользователя, сгруппированную по датам.
/**
 * Получает историю раскладов пользователя, сгруппированную по датам.
 */
async function getSpreadHistory(req, res) {
  const userId = req.params.userId;

  try {
    // Получаем все расклады пользователя, отсортированные по дате создания
    const { data: spreads, error } = await supabase
      .from('spreads')
      .select('id, DateCreate, Runes, Description')
      .eq('Userid', userId)
      .order('DateCreate', { ascending: false });

    if (error) {
      console.error('Ошибка при получении истории раскладов:', error);
      return res.status(500).json({ message: 'Ошибка при получении истории раскладов' });
    }

    // Группируем расклады по дате
    const groupedSpreads = spreads.reduce((acc, spread) => {
      const date = new Date(spread.DateCreate).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!acc[date]) {
        acc[date] = [];
      }

      acc[date].push({
        id: spread.id,
        Runes: spread.Runes,
        description: spread.Description, // Добавляем описание в ответ
      });

      return acc;
    }, {});

    res.status(200).json(groupedSpreads);
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    res.status(500).json({ message: 'Ошибка при обработке запроса' });
  }
}

// Этот эндпоинт вернёт конкретный расклад с рунами, описанием и датой.
async function getSpreadDetails(req, res) {
    const spreadId = req.params.spreadId;
  
    try {
      const { data: spread, error } = await supabase
        .from('spreads')
        .select('Runes, DateCreate, Description') // Исправлены названия столбцов
        .eq('id', spreadId)
        .single();
  
      if (error) {
        console.error('Ошибка при получении деталей расклада:', error);
        return res.status(500).json({ message: 'Ошибка при получении деталей расклада' });
      }
  
      res.status(200).json(spread);
    } catch (error) {
      console.error('Ошибка при обработке запроса:', error);
      res.status(500).json({ message: 'Ошибка при обработке запроса' });
    }
  }
  
  
  module.exports = {
    getSpreadHistory,
    getSpreadDetails
  };
  